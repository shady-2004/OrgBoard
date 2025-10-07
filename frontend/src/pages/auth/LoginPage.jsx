import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { t } from '../../utils/translations';

export const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || t('auth.loginFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">لوحة المنظمات</h1>
          <p className="text-gray-600">{t('auth.signInToAccount')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <Input
            label={t('auth.email')}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder={t('auth.enterEmail')}
          />

          <Input
            label={t('auth.password')}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder={t('auth.enterPassword')}
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t('auth.signingIn') : t('auth.signIn')}
          </Button>
        </form>

        {/* Signup disabled - admin creates accounts via Users page */}
        {/* <div className="mt-6 text-center text-sm text-gray-600">
          {t('auth.dontHaveAccount')}{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
            {t('auth.register')}
          </Link>
        </div> */}
      </Card>
    </div>
  );
};
