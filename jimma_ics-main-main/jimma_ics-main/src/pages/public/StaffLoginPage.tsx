import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Landmark, LockKeyhole, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getAuthorizedDashboard, checkRoutePermission } from '../../middleware/authMiddleware';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

type FormMode = 'login' | 'register';

export const StaffLoginPage: React.FC = () => {
  const { currentUser, isLoggedIn, authReady, login, register, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<FormMode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!authReady || !isLoggedIn) return;
    const redirect = new URLSearchParams(location.search).get('redirect');
    const dashboard = getAuthorizedDashboard(currentUser).dashboardPath;
    const destination = redirect?.startsWith('/admin') && checkRoutePermission(currentUser, redirect).isAuthorized
      ? redirect
      : dashboard;
    navigate(destination, { replace: true });
  }, [authReady, currentUser, isLoggedIn, location.search, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'register' && password !== confirmPassword) {
      setErrorMessage('The passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'register') {
        await register({ fullName, email, phone: phone || undefined, password });
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        setSuccessMessage('Your account was created. Sign in to continue. A council administrator must assign your staff role before staff workspace access is enabled.');
      } else {
        const user = await login(email, password, rememberMe);
        const redirect = new URLSearchParams(location.search).get('redirect');
        const dashboard = getAuthorizedDashboard(user).dashboardPath;
        const destination = redirect?.startsWith('/admin') && checkRoutePermission(user, redirect).isAuthorized
          ? redirect
          : dashboard;
        navigate(destination, { replace: true });
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to complete your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <main className="min-h-[75vh] max-w-2xl mx-auto px-4 py-12 flex items-center">
        <Card className="w-full p-7 sm:p-9 text-center space-y-5">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">Signed in as {currentUser.name}</h1>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{currentUser.role} · {currentUser.email}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => navigate(getAuthorizedDashboard(currentUser).dashboardPath)} icon={<ArrowRight className="w-4 h-4" />}>
              Continue to workspace
            </Button>
            <Button variant="outline" onClick={() => void logout()}>Sign out</Button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-[80vh] max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
      <div className="mb-7 flex items-center justify-between gap-3">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-emerald-700 dark:text-stone-400 dark:hover:text-emerald-300">
          <ArrowLeft className="w-4 h-4" /> Return to public portal
        </Link>
        <span className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-4 h-4" /> Secure staff access
        </span>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        <section className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 p-7 sm:p-9 text-white flex flex-col justify-between min-h-64">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-amber-300/30 text-amber-300 flex items-center justify-center">
              <Landmark className="w-6 h-6" />
            </div>
            <p className="mt-8 text-xs uppercase tracking-[0.2em] text-amber-300 font-semibold">Jimma Islamic Council</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-serif font-bold leading-tight">Staff & faculty portal</h1>
            <p className="mt-4 text-sm leading-relaxed text-emerald-100/85">
              Sign in with your council account. Access is assigned by your account’s role and permissions.
            </p>
          </div>
          <div className="mt-8 pt-5 border-t border-white/15 flex items-center gap-2 text-xs text-emerald-100/80">
            <LockKeyhole className="w-4 h-4 text-amber-300" /> Credentials are verified by the council server
          </div>
        </section>

        <section className="lg:col-span-7">
          <Card className="h-full p-6 sm:p-8 space-y-6 shadow-lg">
            <div className="flex gap-2 p-1 rounded-xl bg-stone-100 dark:bg-stone-800">
              <button type="button" onClick={() => { setMode('login'); setErrorMessage(''); setSuccessMessage(''); }} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${mode === 'login' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-500 dark:text-stone-400'}`}>
                Sign in
              </button>
              <button type="button" onClick={() => { setMode('register'); setErrorMessage(''); setSuccessMessage(''); }} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${mode === 'register' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-500 dark:text-stone-400'}`}>
                Create staff account
              </button>
            </div>

            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                {mode === 'login' ? 'Welcome back' : 'Request a council account'}
              </h2>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                {mode === 'login' ? 'Enter the email and password associated with your account.' : 'New accounts start with no staff permissions. An administrator assigns access.'}
              </p>
            </div>

            {errorMessage && (
              <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div role="status" className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Full name</span>
                  <span className="relative block">
                    <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input autoComplete="name" required minLength={2} maxLength={150} value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full border border-stone-200 bg-white py-3 pl-10 pr-3 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100" placeholder="Your full name" />
                  </span>
                </label>
              )}

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Email address</span>
                <span className="relative block">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input autoComplete="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full border border-stone-200 bg-white py-3 pl-10 pr-3 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100" placeholder="name@council.org" />
                </span>
              </label>

              {mode === 'register' && (
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Phone <span className="font-normal text-stone-400">(optional)</span></span>
                  <span className="relative block">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input autoComplete="tel" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full border border-stone-200 bg-white py-3 pl-10 pr-3 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100" placeholder="+251 ..." />
                  </span>
                </label>
              )}

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Password</span>
                <span className="relative block">
                  <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input autoComplete={mode === 'login' ? 'current-password' : 'new-password'} type={showPassword ? 'text' : 'password'} required minLength={mode === 'register' ? 10 : 1} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border border-stone-200 bg-white py-3 pl-10 pr-12 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100" placeholder={mode === 'register' ? 'At least 10 characters' : 'Enter your password'} />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-700 dark:hover:text-stone-100" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
              </label>

              {mode === 'register' ? (
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Confirm password</span>
                  <input autoComplete="new-password" type="password" required minLength={10} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full border border-stone-200 bg-white px-3 py-3 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100" placeholder="Re-enter your password" />
                </label>
              ) : (
                <label className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                  <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="rounded border-stone-300 text-emerald-700 focus:ring-emerald-600" />
                  Remember me on this device
                </label>
              )}

              <Button type="submit" size="lg" disabled={isLoading} className="w-full justify-center">
                {isLoading ? 'Please wait…' : mode === 'login' ? 'Sign in securely' : 'Create account'}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <p className="flex items-center justify-center gap-2 border-t border-stone-100 pt-4 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Role and permissions are checked by the backend
            </p>
          </Card>
        </section>
      </div>
    </main>
  );
};
