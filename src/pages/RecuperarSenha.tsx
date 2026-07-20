import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const recuperarSchema = z.object({
  email: z.string().min(1, 'O e-mail é obrigatório').email('Insira um e-mail válido')
});

type RecuperarFormValues = z.infer<typeof recuperarSchema>;

export const RecuperarSenha: React.FC = () => {
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RecuperarFormValues>({
    resolver: zodResolver(recuperarSchema)
  });

  const onSubmit = async (_data: RecuperarFormValues) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSuccess(true);
  };

  const logoSrc = "/logo-horizontal.jpeg";

  return (
    <div className="min-h-screen w-full flex bg-surface font-sans items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-border rounded-premium shadow-premium p-6 md:p-8 flex flex-col gap-6 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Link to="/" className="flex items-center gap-3 select-none">
            <img src={logoSrc} alt="Logo PixelConta" className="h-9 w-auto object-contain" />

          </Link>
        </div>

        {success ? (
          <div className="flex flex-col gap-5 text-center items-center py-4 animate-fade-in">
            <div className="p-3.5 bg-green-50 text-green-600 rounded-full w-fit">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-bold text-text-primary font-title">E-mail de recuperação enviado</h3>
              <p className="text-xs text-text-secondary leading-relaxed max-w-xs mx-auto">
                Se este e-mail estiver cadastrado na plataforma, você receberá um link com instruções para redefinir sua senha.
              </p>
            </div>
            <Link to="/login" className="w-full mt-2">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar para o Login</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 text-center mb-1">
              <h2 className="text-xl font-bold text-text-primary font-title">
                Recupere sua senha
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed max-w-xs mx-auto">
                Insira o seu e-mail de cadastro abaixo e enviaremos as instruções para a redefinição de acesso.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <Input
                {...register('email')}
                label="Qual seu e-mail cadastrado?"
                placeholder="nome@empresa.com.br"
                error={errors.email?.message}
                icon={<Mail className="h-4.5 w-4.5" />}
              />

              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                className="w-full mt-2"
              >
                Enviar link de redefinição
              </Button>
            </form>

            <Link to="/login" className="flex items-center justify-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors font-bold mt-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar para o Login</span>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};
export default RecuperarSenha;
