import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddReferralModal from '../components/AddReferralModal/AddReferralModal';
import './DashboardPage.scss';
import { apiGet, apiPost } from '../api/client';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_views: 0, total_clicks: 0, total_products: 0 });
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const data = await apiGet('/dashboard/stats/', { cache: false, cacheTtlMs: 0 });
      setStats(data?.stats ?? { total_views: 0, total_clicks: 0, total_products: 0 });
      setReferrals(Array.isArray(data?.referrals) ? data.referrals : []);
    } catch (err) {
      navigate('/'); // Если не авторизован или не сотрудник
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить эту реферальную ссылку? Вся статистика также будет удалена.')) return;

    try {
      await apiPost('/dashboard/delete-referral/', { referral_id: id });
      fetchData(); // Обновляем таблицу и статистику
    } catch (err) {
      const msg = err?.response?.data?.error || 'Ошибка при удалении';
      alert(msg);
    }
  };

  if (loading) return <div className="dashboard-loading">Загрузка статистики...</div>;

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Панель управления</h1>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          + Добавить реферальную ссылку
        </button>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-info">
            <h3>{stats.total_views}</h3>
            <p>Всего просмотров</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🖱️</div>
          <div className="stat-info">
            <h3>{stats.total_clicks}</h3>
            <p>Всего переходов</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>{stats.total_products}</h3>
            <p>Активных продуктов</p>
          </div>
        </div>
      </div>

      <div className="referrals-table-wrapper">
        <h2>Ваши реферальные ссылки</h2>
        {referrals.length === 0 ? (
          <p className="empty-state">У вас пока нет созданных ссылок.</p>
        ) : (
          <table className="referrals-table">
            <thead>
              <tr>
                <th>Продукт</th>
                <th>Ссылка</th>
                <th>Просмотры</th>
                <th>Переходы</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((ref) => (
                <tr key={ref.id}>
                  <td>{ref.product_name}</td>
                  <td className="link-cell">
                    <a href={ref.link} target="_blank" rel="noreferrer">
                      {ref.link}
                    </a>
                  </td>
                  <td>{ref.views}</td>
                  <td>{ref.clicks}</td>
                  <td>
                    <button className="btn-danger" onClick={() => handleDelete(ref.id)}>
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <AddReferralModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default DashboardPage;
