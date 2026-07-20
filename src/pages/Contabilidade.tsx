import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Calendar, Download, FileText
} from 'lucide-react';
import { db } from '../mocks/db';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../context/ToastContext';
import type { ChatMessage } from '../types';

export const Contabilidade: React.FC = () => {
  const toast = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>(() => db.chatMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'client',
      text: inputMessage,
      timestamp: new Date().toISOString()
    };

    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    db.chatMessages = nextMsgs;
    setInputMessage('');

    // Simulate accountant response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      let replyText = 'Entendido, Ricardo. Vou verificar essa informação junto à prefeitura e te retorno em instantes!';
      
      const lowerText = userMsg.text.toLowerCase();
      if (lowerText.includes('rejeição') || lowerText.includes('nota') || lowerText.includes('rejeitada')) {
        replyText = 'Sobre a rejeição, verifique se a alíquota municipal do ISS foi configurada como 2%. Se precisar de ajuda para alterar o CNAE de emissão padrão, posso atualizar aqui para você.';
      } else if (lowerText.includes('imposto') || lowerText.includes('das') || lowerText.includes('pagar')) {
        replyText = 'As guias do Simples Nacional (DAS) vencem no dia 20 de cada mês. Eu já fiz o upload da guia de Junho na aba de Guias Disponíveis à direita. É só baixar e realizar o pagamento.';
      } else if (lowerText.includes('certificado') || lowerText.includes('a1')) {
        replyText = 'Seu certificado digital A1 está próximo do vencimento. Quando adquirir o novo arquivo .pfx, basta fazer o upload nas configurações da sua empresa ou na aba de pendências.';
      }

      const accountantMsg: ChatMessage = {
        id: `msg-acc-${Date.now()}`,
        sender: 'accountant',
        text: replyText,
        timestamp: new Date().toISOString()
      };

      const finalMsgs = [...nextMsgs, accountantMsg];
      setMessages(finalMsgs);
      db.chatMessages = finalMsgs;
      toast.success('Nova mensagem da contadora Helena Moreira!');
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 w-full flex-1">
      <PageHeader
        title="Atendimento Contábil"
        description="Fale com sua contadora dedicada e acompanhe solicitações e obrigações fiscais."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-stretch">
        
        {/* Chat Component Column (Left 2 cols) */}
        <div className="lg:col-span-2 border border-pixel-neutral-200 rounded-premium bg-white shadow-premium flex flex-col h-[520px] overflow-hidden">
          
          {/* Accountant Header */}
          <div className="p-4 border-b border-pixel-neutral-200 flex justify-between items-center bg-neutral-bgSecondary/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100" 
                  alt="Helena Moreira" 
                  className="h-10 w-10 rounded-full border border-brand-teal/20 object-cover"
                />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-600 border-2 border-white animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-pixel-navy-900 font-title">Helena Moreira</span>
                <span className="text-[10px] text-pixel-navy-900 font-semibold">Sua Contadora Dedicada (Online)</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Ligação por voz/vídeo não disponível no protótipo.')}
              className="text-xs !py-1 !px-2.5"
            >
              Agendar Reunião
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-neutral-bg/10">
            {messages.map((msg) => {
              const isMe = msg.sender === 'client';
              return (
                <div 
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}
                >
                  {/* Avatar */}
                  <div className="shrink-0">
                    {isMe ? (
                      <img 
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" 
                        alt="Ricardo" 
                        className="h-7 w-7 rounded-full object-cover border border-pixel-neutral-200"
                      />
                    ) : (
                      <img 
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100" 
                        alt="Helena" 
                        className="h-7 w-7 rounded-full object-cover border border-brand-teal/10"
                      />
                    )}
                  </div>

                  {/* Bubble */}
                  <div className={`p-3.5 rounded-premium text-xs leading-relaxed shadow-sm
                    ${isMe 
                      ? 'bg-pixel-navy-900 text-white rounded-tr-none' 
                      : 'bg-white text-pixel-neutral-900 rounded-tl-none border border-pixel-neutral-200'}`}
                  >
                    <p>{msg.text}</p>
                    <span className={`text-[9px] block mt-1.5 text-right
                      ${isMe ? 'text-brand-lightBlue/60' : 'text-brand-grayBlue/60'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Accountant is typing animation */}
            {isTyping && (
              <div className="flex gap-3 max-w-[85%] self-start animate-pulse">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100" 
                  alt="Helena" 
                  className="h-7 w-7 rounded-full object-cover border border-brand-teal/10 shrink-0"
                />
                <div className="bg-white border border-pixel-neutral-200 p-3.5 rounded-premium rounded-tl-none text-xs text-pixel-neutral-500 flex items-center gap-1">
                  <span>Helena está digitando</span>
                  <span className="animate-bounce font-bold">.</span>
                  <span className="animate-bounce delay-150 font-bold">.</span>
                  <span className="animate-bounce delay-300 font-bold">.</span>
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>

          {/* Form input Entry bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-pixel-neutral-200 flex gap-2 bg-white shrink-0">
            <Input
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="Digite sua mensagem para a contabilidade (ex: 'DAS', 'rejeição')..."
              className="flex-1"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={<Send className="h-4 w-4" />}
              className="shrink-0"
            >
              Enviar
            </Button>
          </form>

        </div>

        {/* Sidebar Information Column (Right 1 col) */}
        <div className="flex flex-col gap-6">
          
          {/* Requested Documents & Pending obligations */}
          <div className="border border-pixel-neutral-200 rounded-premium bg-white p-5 shadow-premium flex flex-col gap-4 text-xs">
            <h3 className="font-bold text-pixel-navy-900 font-title uppercase tracking-wider text-[10px] pb-2 border-b border-pixel-neutral-200 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-pixel-navy-900" />
              <span>Calendário Fiscal Mensal</span>
            </h3>
            
            <div className="flex flex-col gap-3">
              {[
                { title: 'Enviar Extrato Bancário Inter', desc: 'Competência 06/2026', date: 'Vence em 12/07', isPast: false },
                { title: 'Pagamento da Guia DAS Simples', desc: 'Valor: R$ 850,22', date: 'Vence em 20/07', isPast: false },
                { title: 'Envio da Declaração Faturamento', desc: 'Prefeitura municipal', date: 'Concluído em 05/07', isPast: true }
              ].map((item, idx) => (
                <div key={idx} className={`p-3 rounded-soft border flex flex-col gap-1
                  ${item.isPast 
                    ? 'bg-neutral-bgDisabled/50 border-pixel-neutral-200 opacity-60' 
                    : 'bg-neutral-bgSecondary/60 border-pixel-neutral-200 hover:border-brand-teal/20 hover:bg-white transition-all'}`}>
                  <div className="flex justify-between items-center font-semibold">
                    <span className={item.isPast ? 'text-pixel-neutral-500 line-through' : 'text-pixel-navy-900'}>
                      {item.title}
                    </span>
                    <span className={`text-[8px] font-bold px-1 py-0.5 rounded
                      ${item.isPast ? 'bg-green-50 text-green-600' : 'bg-pixel-gold-300 text-pixel-gold-600'}`}>
                      {item.isPast ? 'Ok' : 'Pendente'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-brand-grayBlue/80">
                    <span>{item.desc}</span>
                    <span className="font-bold">{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Guides downloads available */}
          <div className="border border-pixel-neutral-200 rounded-premium bg-white p-5 shadow-premium flex flex-col gap-4 text-xs">
            <h3 className="font-bold text-pixel-navy-900 font-title uppercase tracking-wider text-[10px] pb-2 border-b border-pixel-neutral-200 flex items-center gap-1.5">
              <Download className="h-4 w-4 text-pixel-navy-900" />
              <span>Guias de Impostos Disponíveis</span>
            </h3>
            
            <div className="flex flex-col gap-2.5">
              {[
                { name: 'Guia_DAS_PixelDigital_06-2026.pdf', size: '320 KB' },
                { name: 'Folha_Prolabore_Ricardo_06-2026.pdf', size: '150 KB' }
              ].map((guide, idx) => (
                <div 
                  key={idx} 
                  onClick={() => toast.success(`Download de ${guide.name} iniciado.`)}
                  className="p-3 border border-pixel-neutral-200 rounded-soft hover:border-brand-teal/20 hover:bg-pixel-navy-900-soft/10 cursor-pointer transition-all flex items-center justify-between gap-3 text-[11px]"
                >
                  <div className="flex items-center gap-2 max-w-[170px] truncate">
                    <FileText className="h-4 w-4 text-pixel-navy-900 shrink-0" />
                    <span className="font-semibold text-pixel-neutral-900" title={guide.name}>{guide.name}</span>
                  </div>
                  <span className="text-[10px] text-pixel-neutral-500 shrink-0">{guide.size}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
export default Contabilidade;
