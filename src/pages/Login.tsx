import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileText, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Checkbox';
import { useToast } from '../context/ToastContext';
import { authService, sessionService } from '../services/supabaseApi';

const loginSchema = z.object({
  email: z.string().min(1, 'O e-mail é obrigatório').email('Insira um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  rememberMe: z.boolean().optional()
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'ricardo@pixelconta.com.br', password: 'senha123', rememberMe: true }
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await authService.signIn({ email: data.email, password: data.password });
      const status = await sessionService.status();
      if (!status.hasProfile || !status.hasActiveCompany) {
        toast.info('Conta confirmada. Vamos finalizar a configuracao da empresa.');
        navigate('/onboarding');
        return;
      }
      toast.success('Login realizado com sucesso! Bem-vindo de volta.');
      navigate('/app/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel realizar o login.');
    }
  };

  const logoSrc = "/logo-horizontal.jpeg";

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-surface font-sans">
      
      {/* Left side: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-16 lg:px-24 bg-white z-10">
        <div className="w-full max-w-md mx-auto flex flex-col gap-8">
          
          {/* Logo header */}
          <div className="flex flex-col gap-2">
            <Link to="/" className="flex items-center gap-3 select-none w-fit">
              <img src={logoSrc} alt="Logo PixelConta" className="h-9 w-auto object-contain" />

            </Link>
          </div>

          {/* Title & subtitle */}
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-black text-text-primary font-title">
              Entre na sua conta
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Bem-vindo de volta! Insira suas credenciais abaixo para acessar o painel.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <Input
              {...register('email')}
              label="E-mail profissional"
              placeholder="seu.email@empresa.com"
              error={errors.email?.message}
              icon={<Mail className="h-4.5 w-4.5" />}
              autoComplete="email"
            />
            
            <div className="flex flex-col gap-1">
              <Input
                {...register('password')}
                type="password"
                label="Senha de acesso"
                placeholder="Digite sua senha"
                error={errors.password?.message}
                icon={<KeyRound className="h-4.5 w-4.5" />}
                autoComplete="current-password"
              />
              <div className="flex items-center justify-between mt-1 text-xs">
                <Checkbox
                  {...register('rememberMe')}
                  label="Lembrar de mim"
                />
                <Link to="/recuperar-senha" className="text-text-primary hover:underline font-bold">
                  Esqueci minha senha
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              className="w-full mt-2"
            >
              Entrar no sistema
            </Button>
          </form>

          {/* Split / Social logins separator */}
          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <span className="relative px-3 bg-white text-[10px] uppercase font-bold text-text-secondary tracking-wider">
              Ou acesse com
            </span>
          </div>

          {/* Social login buttons */}
          <div className="grid grid-cols-2 gap-3.5">
            <button 
              type="button"
              onClick={() => {
                toast.info('Login social via Google sera conectado em uma proxima etapa.');
              }}
              className="flex items-center justify-center gap-2 py-2 px-3 border border-border rounded-soft hover:bg-surface text-xs font-semibold text-text-primary transition-all active:scale-[0.98]"
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2a5.55 5.55 0 0 1-5.55-5.55 5.55 5.55 0 0 1 5.55-5.55c2.316 0 4.269 1.157 5.394 3.013l3.355-3.355C20.62 4.9 16.73 3 12.24 3c-5.522 0-10 4.478-10 10s4.478 10 10 10c5.84 0 9.873-4.105 9.873-10.04a8.9 8.9 0 0 0-.173-1.675H12.24Z"/>
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => {
                toast.info('Login social via Apple sera conectado em uma proxima etapa.');
              }}
              className="flex items-center justify-center gap-2 py-2 px-3 border border-border rounded-soft hover:bg-surface text-xs font-semibold text-text-primary transition-all active:scale-[0.98]"
            >
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.84-.98 2.94.1.08.2.1.28.1 1.05 0 1.92-.58 2.53-1.43z"/>
              </svg>
              <span>Apple</span>
            </button>
          </div>

          {/* Creation Link */}
          <p className="text-center text-xs text-text-secondary font-medium">
            Ainda não possui uma conta?{' '}
            <Link to="/cadastro" className="text-text-primary hover:underline font-bold">
              Criar conta
            </Link>
          </p>

        </div>
      </div>

      {/* Right side: Gradient background & mockup */}
      <div className="hidden md:flex flex-1 bg-grad-inst justify-center items-center p-12 relative overflow-hidden">
        
        {/* Subtle circles background decoration */}
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/5 filter blur-3xl transform translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-primary/5 filter blur-3xl transform -translate-x-24 translate-y-24"></div>

        {/* Content Box */}
        <div className="max-w-md w-full flex flex-col gap-8 text-center text-white relative z-10">
          
          {/* Abstract Invoice mockup floating */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-premium p-6 shadow-premium-hover flex flex-col gap-4 text-left font-sans select-none animate-pulse">
            <div className="flex justify-between items-center pb-3 border-b border-white/10 text-white">
              <div className="flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-text-primary" />
                <span className="font-bold font-title text-xs tracking-wide">NOTA FISCAL NFS-e</span>
              </div>
              <span className="text-[10px] bg-primary/20 text-text-primary font-bold px-2 py-0.5 rounded border border-primary/30">
                AUTORIZADA
              </span>
            </div>
            
            <div className="flex flex-col gap-1.5 text-xs text-white/80">
              <div className="flex justify-between">
                <span>Tomador:</span>
                <span className="font-semibold text-white">Mariana Souza</span>
              </div>
              <div className="flex justify-between">
                <span>Valor do Serviço:</span>
                <span className="font-semibold text-white">R$ 299,00</span>
              </div>
              <div className="flex justify-between">
                <span>CNAE principal:</span>
                <span className="font-semibold text-white">8523-4/99</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-2.5 rounded-soft text-[10px] text-text-primary flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Assinada digitalmente via Certificado A1</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xl font-bold font-title text-white">
              Automatize suas notas e economize tempo
            </h3>
            <p className="text-xs text-white/80 leading-relaxed">
              Evite digitação manual e erros fiscais. A PixelConta conecta suas vendas e realiza a emissão instantaneamente.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
export default Login;
