import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2, Gift } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, fullName);

    if (!error) {
      navigate('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle bg-purple-grid flex items-center justify-center p-4">
      <Card className="w-full max-w-md" style={{ borderColor: 'hsl(265 60% 50% / 0.75)' }}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-gradient-primary rounded-xl text-primary-foreground w-fit">
            <UserPlus className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">دروستکردنی هەژمار</CardTitle>
          <CardDescription className="latin-text">Create your account</CardDescription>
          <Badge className="mx-auto mt-3 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <Gift className="h-3 w-3 mr-1" />
            100 کریدیتی بەخشراو!
          </Badge>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="latin-text">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Your Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
                className="latin-text"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="latin-text">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="latin-text"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="latin-text">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                className="latin-text"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="latin-text">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                className="latin-text"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full btn-academic-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  دروستکردن...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  دروستکردنی هەژمار
                </>
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              هەژمارت هەیە؟{' '}
              <Link to="/login" className="text-primary hover:underline">
                بچۆ ژوورەوە
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
