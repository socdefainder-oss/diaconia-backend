#!/usr/bin/env python3
"""
Script para gerar arquivos do frontend do sistema de questionário.
Execute de dentro do diretório diaconia-frontend
"""
import os
import sys

# Definir o diretório do frontend (assumindo estrutura padrão)
FRONTEND_DIR = "../diaconia-frontend"

# Conteúdo dos arquivos a serem criados

TYPES_UPDATE = '''
// Adicionar estas interfaces ao arquivo types/index.ts existente

export interface QuizOption {
  text: string;
  isCorrect?: boolean; // Só vem para admin
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
  order: number;
}

// Atualizar interface Lesson para incluir:
// quiz?: QuizQuestion[];

// Atualizar interface LessonProgress para incluir:
// quizCompleted: boolean;
// quizScore?: number;
// quizPassed: boolean;
// quizAttempts: number;
'''

QUIZ_SERVICE = '''import api from './api';

export interface QuizAnswer {
  questionIndex: number;
  selectedOption: number;
}

export interface QuizSubmitResponse {
  success: boolean;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
  message: string;
  results: Array<{
    questionIndex: number;
    selectedOption: number;
    correctOption: number;
    isCorrect: boolean;
  }>;
}

export const quizService = {
  // Obter perguntas do quiz (sem respostas corretas)
  getQuestions: async (courseId: string, moduleId: string | null, lessonId: string) => {
    const modId = moduleId || 'null';
    const response = await api.get(`/quiz/${courseId}/${modId}/${lessonId}/questions`);
    return response.data;
  },

  // Enviar respostas do quiz
  submitAnswers: async (
    courseId: string,
    moduleId: string | null,
    lessonId: string,
    answers: QuizAnswer[]
  ): Promise<QuizSubmitResponse> => {
    const modId = moduleId || 'null';
    const response = await api.post(`/quiz/${courseId}/${modId}/${lessonId}/submit`, {
      answers,
    });
    return response.data;
  },

  // Obter histórico de tentativas
  getAttempts: async (courseId: string, lessonId: string) => {
    const response = await api.get(`/quiz/${courseId}/${lessonId}/attempts`);
    return response.data;
  },

  // Obter melhor tentativa
  getBestAttempt: async (courseId: string, lessonId: string) => {
    const response = await api.get(`/quiz/${courseId}/${lessonId}/best`);
    return response.data;
  },
};
'''

QUIZ_EDITOR = '''import React, { useState } from 'react';
import { QuizQuestion, QuizOption } from '@/types';

interface QuizEditorProps {
  quiz: QuizQuestion[];
  onChange: (quiz: QuizQuestion[]) => void;
}

export default function QuizEditor({ quiz, onChange }: QuizEditorProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    quiz.length > 0 
      ? quiz 
      : Array(5).fill(null).map((_, i) => ({
          question: '',
          options: Array(4).fill(null).map(() => ({ text: '', isCorrect: false })),
          order: i,
        }))
  );

  const updateQuestion = (index: number, field: 'question', value: string) => {
    const updated = [...questions];
    updated[index].question = value;
    setQuestions(updated);
    onChange(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].text = value;
    setQuestions(updated);
    onChange(updated);
  };

  const setCorrectOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.map((opt, i) => ({
      ...opt,
      isCorrect: i === oIndex,
    }));
    setQuestions(updated);
    onChange(updated);
  };

  const isValid = () => {
    return questions.every(q => 
      q.question.trim() !== '' &&
      q.options.every(o => o.text.trim() !== '') &&
      q.options.filter(o => o.isCorrect).length === 1
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Questionário (5 Perguntas Obrigatórias)</h3>
        {!isValid() && (
          <span className="text-sm text-red-600">
            ⚠️ Complete todas as perguntas e marque a resposta correta
          </span>
        )}
      </div>

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="border rounded-lg p-4 bg-gray-50">
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              Pergunta {qIndex + 1} *
            </label>
            <input
              type="text"
              value={q.question}
              onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
              placeholder="Digite a pergunta..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Opções (marque a correta):</label>
            {q.options.map((opt, oIndex) => (
              <div key={oIndex} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`question-${qIndex}`}
                  checked={opt.isCorrect}
                  onChange={() => setCorrectOption(qIndex, oIndex)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="font-medium">{String.fromCharCode(65 + oIndex)}:</span>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                  placeholder={`Opção ${String.fromCharCode(65 + oIndex)}`}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                {opt.isCorrect && (
                  <span className="text-green-600 font-semibold">✓ Correta</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="text-sm text-gray-600">
        <p>⚠️ Todas as 5 perguntas são obrigatórias</p>
        <p>⚠️ Cada pergunta deve ter 4 opções e apenas 1 correta</p>
        <p>⚠️ O aluno precisa acertar no mínimo 4 questões (80%) para avançar</p>
      </div>
    </div>
  );
}
'''

QUIZ_PLAYER = '''import React, { useState, useEffect } from 'react';
import { quizService, QuizAnswer } from '@/services/quizService';
import { QuizQuestion } from '@/types';

interface QuizPlayerProps {
  courseId: string;
  moduleId: string | null;
  lessonId: string;
  onComplete: (passed: boolean) => void;
}

export default function QuizPlayer({ courseId, moduleId, lessonId, onComplete }: QuizPlayerProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuestions();
  }, [courseId, moduleId, lessonId]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await quizService.getQuestions(courseId, moduleId, lessonId);
      setQuestions(data.questions);
      setAnswers(Array(5).fill(null).map((_, i) => ({ questionIndex: i, selectedOption: -1 })));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar questionário');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionIndex: number, optionIndex: number) => {
    const updated = [...answers];
    updated[questionIndex].selectedOption = optionIndex;
    setAnswers(updated);
  };

  const canSubmit = () => {
    return answers.every(a => a.selectedOption >= 0);
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      setError('Responda todas as perguntas antes de enviar');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const data = await quizService.submitAnswers(courseId, moduleId, lessonId, answers);
      setResult(data);
      onComplete(data.passed);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar respostas');
    } finally {
      setSubmitting(false);
    }
  };

  const retry = () => {
    setResult(null);
    setAnswers(Array(5).fill(null).map((_, i) => ({ questionIndex: i, selectedOption: -1 })));
    setError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <div className={`text-6xl mb-4 ${result.passed ? 'text-green-500' : 'text-red-500'}`}>
            {result.passed ? '✓' : '✗'}
          </div>
          <h3 className={`text-2xl font-bold mb-2 ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
            {result.passed ? 'Parabéns!' : 'Não foi desta vez'}
          </h3>
          <p className="text-gray-600 mb-4">{result.message}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">{result.correctAnswers}/5</div>
              <div className="text-sm text-gray-600">Acertos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">{result.score}%</div>
              <div className="text-sm text-gray-600">Pontuação</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {result.results.map((r: any, i: number) => (
            <div key={i} className={`p-3 rounded-lg ${r.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-2">
                <span className={r.isCorrect ? 'text-green-600' : 'text-red-600'}>
                  {r.isCorrect ? '✓' : '✗'}
                </span>
                <span className="font-medium">Questão {i + 1}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          {!result.passed && (
            <button
              onClick={retry}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Tentar Novamente
            </button>
          )}
          {result.passed && (
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Continuar para Próxima Aula
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">Questionário da Aula</h3>
        <p className="text-gray-600">
          Responda todas as 5 perguntas. Você precisa acertar pelo menos 4 para avançar.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6 mb-6">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">
              {qIndex + 1}. {q.question}
            </h4>
            <div className="space-y-2">
              {q.options.map((opt: any, oIndex: number) => {
                const isSelected = answers[qIndex]?.selectedOption === oIndex;
                return (
                  <label
                    key={oIndex}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      checked={isSelected}
                      onChange={() => selectAnswer(qIndex, oIndex)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="font-medium">{String.fromCharCode(65 + oIndex)}.</span>
                    <span>{opt.text}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit() || submitting}
        className={`w-full px-6 py-3 rounded-lg font-semibold transition ${
          canSubmit() && !submitting
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {submitting ? 'Enviando...' : 'Enviar Respostas'}
      </button>

      <div className="mt-4 text-center text-sm text-gray-600">
        {answers.filter(a => a.selectedOption >= 0).length}/5 perguntas respondidas
      </div>
    </div>
  );
}
'''

def create_file(path, content):
    """Cria um arquivo com o conteúdo fornecido"""
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Criado: {path}")
        return True
    except Exception as e:
        print(f"❌ Erro ao criar {path}: {e}")
        return False

def main():
    if not os.path.exists(FRONTEND_DIR):
        print(f"❌ Diretório do frontend não encontrado: {FRONTEND_DIR}")
        print("Execute este script do diretório diaconia-backend")
        sys.exit(1)

    print("🚀 Gerando arquivos do frontend para sistema de questionário...\n")

    files_created = 0

    # Criar serviço de quiz
    if create_file(
        os.path.join(FRONTEND_DIR, "services", "quizService.ts"),
        QUIZ_SERVICE
    ):
        files_created += 1

    # Criar componente QuizEditor
    if create_file(
        os.path.join(FRONTEND_DIR, "components", "QuizEditor.tsx"),
        QUIZ_EDITOR
    ):
        files_created += 1

    # Criar componente QuizPlayer
    if create_file(
        os.path.join(FRONTEND_DIR, "components", "QuizPlayer.tsx"),
        QUIZ_PLAYER
    ):
        files_created += 1

    # Criar arquivo de instruções para types
    if create_file(
        os.path.join(FRONTEND_DIR, "TYPES_UPDATE_NEEDED.txt"),
        TYPES_UPDATE
    ):
        files_created += 1

    print(f"\n✅ {files_created} arquivos criados com sucesso!")
    print("\n📝 PRÓXIMOS PASSOS:")
    print("1. Abra types/index.ts e adicione as interfaces conforme TYPES_UPDATE_NEEDED.txt")
    print("2. Integre QuizEditor na página de edição de curso/aula")
    print("3. Integre QuizPlayer na página de visualização de aula")
    print("4. Teste o fluxo completo: criar perguntas → responder → passar/reprovar")

if __name__ == "__main__":
    main()
