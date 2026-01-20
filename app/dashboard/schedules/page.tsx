'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Edit, Trash2, ChevronRight } from 'lucide-react';
import { teamService } from '@/services/teamService';
import { Team } from '@/types';
import toast from 'react-hot-toast';

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    dayOfWeek: 'domingo' as any,
    shift: '',
    teamNumber: 1,
    description: '',
    color: '#3B82F6',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTeams = async () => {
    try {
      const data = await teamService.getTeams();
      setTeams(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao carregar times');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTeam(null);
    setFormData({
      name: '',
      dayOfWeek: 'domingo',
      shift: '',
      teamNumber: 1,
      description: '',
      color: '#3B82F6',
    });
    setShowModal(true);
  };

  const openEditModal = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      dayOfWeek: team.dayOfWeek,
      shift: team.shift || '',
      teamNumber: team.teamNumber,
      description: team.description || '',
      color: team.color || '#3B82F6',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const teamData = {
        ...formData,
        shift: formData.shift || undefined,
      };

      if (editingTeam) {
        await teamService.updateTeam(editingTeam._id, teamData);
        toast.success('Time atualizado com sucesso!');
      } else {
        await teamService.createTeam(teamData);
        toast.success('Time criado com sucesso!');
      }
      setShowModal(false);
      loadTeams();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar time');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este time?')) return;

    try {
      await teamService.deleteTeam(id);
      toast.success('Time excluído com sucesso!');
      loadTeams();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao excluir time');
    }
  };

  const handleTeamClick = (teamId: string) => {
    router.push(`/dashboard/schedules/${teamId}`);
  };

  const groupedTeams = teams.reduce((acc, team) => {
    const key = team.shift 
      ? `${team.dayOfWeek.toUpperCase()} - ${team.shift.toUpperCase()}`
      : team.dayOfWeek.toUpperCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(team);
    return acc;
  }, {} as Record<string, Team[]>);

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Escalas - Selecione o Time</h1>
          <p className="text-gray-600 mt-1">Escolha um time para gerenciar as escalas</p>
        </div>
        {isAdmin && (
          <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Novo Time
          </button>
        )}
      </div>

      {teams.length === 0 ? (
        <div className="card text-center py-12">
          <Users size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum time cadastrado</h3>
          <p className="text-gray-600">Clique em &quot;Novo Time&quot; para começar</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTeams).map(([period, periodTeams]) => (
            <div key={period} className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{period}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {periodTeams.map((team) => (
                  <div
                    key={team._id}
                    className="relative group border-2 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer"
                    style={{ borderColor: team.color }}
                    onClick={() => handleTeamClick(team._id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: team.color }}
                        >
                          {team.teamNumber}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{team.name}</h3>
                          <p className="text-sm text-gray-600">
                            {team.members?.length || 0} membros
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="text-gray-400 group-hover:text-primary-600 transition-colors" />
                    </div>

                    {team.description && (
                      <p className="text-sm text-gray-600 mb-3">{team.description}</p>
                    )}

                    {isAdmin && (
                      <div className="flex gap-2 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(team);
                          }}
                          className="flex-1 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <Edit size={14} />
                          Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(team._id);
                          }}
                          className="flex-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <Trash2 size={14} />
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar/Editar Time */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingTeam ? 'Editar Time' : 'Novo Time'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Time</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Ex: QUARTA - Time 1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dia da Semana</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value as any })}
                    className="input"
                    required
                  >
                    <option value="domingo">Domingo</option>
                    <option value="segunda">Segunda</option>
                    <option value="terça">Terça</option>
                    <option value="quarta">Quarta</option>
                    <option value="quinta">Quinta</option>
                    <option value="sexta">Sexta</option>
                    <option value="sábado">Sábado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                  <input
                    type="number"
                    value={formData.teamNumber}
                    onChange={(e) => setFormData({ ...formData, teamNumber: parseInt(e.target.value) })}
                    className="input"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Turno (opcional)</label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  className="input"
                >
                  <option value="">Nenhum</option>
                  <option value="manhã">Manhã</option>
                  <option value="tarde">Tarde</option>
                  <option value="noite">Noite</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-16 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="input flex-1"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição (opcional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Informações adicionais sobre o time"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={submitting}>
                  {submitting ? 'Salvando...' : editingTeam ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
