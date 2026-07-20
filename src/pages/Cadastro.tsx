import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, KeyRound } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Checkbox';
import { useToast } from '../context/ToastContext';

const cadastroSchema = z.object({
  name: z.string().min(1, 'O nome completo é obrigatório'),
  email: z.string().min(1, 'O e-mail é obrigatório').email('Insira um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  agree: z.boolean().refine(val => val === true, 'Você precisa aceitar os termos de serviço')
});

type CadastroFormValues = z.infer<typeof cadastroSchema>;

export const Cadastro: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CadastroFormValues>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { agree: false }
  });

  const onSubmit = async (_data: CadastroFormValues) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Cadastro realizado com sucesso! Vamos configurar sua empresa agora.');
    navigate('/onboarding');
  };

  const logoSrc = "/logo-horizontal.jpeg";

  return (
    <div className="min-h-screen w-full flex bg-pixel-neutral-50 font-sans items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-pixel-neutral-200 rounded-premium shadow-premium p-6 md:p-8 flex flex-col gap-6 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Link to="/" className="flex items-center gap-3 select-none">
            <img src={logoSrc} alt="Logo PixelConta" className="h-9 w-auto object-contain" />
            <span className="text-xl font-extrabold text-pixel-navy-900 font-title">
              Pixel<span className="text-pixel-navy-900">Contas</span>
            </span>
          </Link>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-pixel-navy-900 font-title">
              Crie sua conta na PixelContas
            </h2>
            <p className="text-xs text-pixel-neutral-500">
              Comece a emitir e automatizar suas notas fiscais de forma inteligente.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            {...register('name')}
            label="Nome Completo"
            placeholder="Digite seu nome"
            error={errors.name?.message}
            icon={<User className="h-4.5 w-4.5" />}
          />
          <Input
            {...register('email')}
            label="E-mail profissional"
            placeholder="seu.email@empresa.com"
            error={errors.email?.message}
            icon={<Mail className="h-4.5 w-4.5" />}
          />
          <Input
            {...register('password')}
            type="password"
            label="Crie uma Senha"
            placeholder="Mínimo de 6 caracteres"
            error={errors.password?.message}
            icon={<KeyRound className="h-4.5 w-4.5" />}
          />
          
          <Checkbox
            {...register('agree')}
            error={errors.agree?.message}
            label={
              <span>
                Li e aceito os{' '}
                <a href="#" className="text-pixel-navy-900 font-bold hover:underline">Termos de Uso</a>
                {' '}e{' '}
                <a href="#" className="text-pixel-navy-900 font-bold hover:underline">Políticas de Privacidade</a>.
              </span>
            }
            className="mt-1"
          />

          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            className="w-full mt-2"
          >
            Cadastrar minha conta
          </Button>
        </form>

        {/* Back links */}
        <p className="text-center text-xs text-pixel-neutral-500 font-medium border-t border-pixel-neutral-200 pt-4">
          Já possui conta cadastrada?{' '}
          <Link to="/login" className="text-pixel-navy-900 hover:underline font-bold">
            Realizar login
          </Link>
        </p>

      </div>
    </div>
  );
};
export default Cadastro;
