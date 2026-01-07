import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabaseClient';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { useNotification } from '../context/NotificationContext';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const ChatPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addNotification } = useNotification();
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: '¡Hola! Soy tu Skin Coach IA. ¿En qué puedo ayudarte con tu rutina de cuidado facial hoy?'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Redirigir si no es PRO
    useEffect(() => {
        if (user && user.subscription_tier !== 'pro') {
            addNotification('El Chat IA es exclusivo para usuarios PRO', 'warning');
            navigate('/subscription');
        }
    }, [user, navigate, addNotification]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        const newMessages = [...messages, { role: 'user', content: userMessage } as Message];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke('skin-coach-chat', {
                body: {
                    messages: newMessages,
                    user_id: user?.id
                }
            });

            if (error) throw error;

            if (data?.text) {
                setMessages([...newMessages, { role: 'assistant', content: data.text }]);
            }
        } catch (error: any) {
            console.error('❌ Error completo del chat:', error);
            let detailedError = error.message;

            // Supabase FunctionsHttpError guarda la respuesta en .context
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const errorBody = await error.context.json();
                    console.error('📦 MENSAJE DEL SERVIDOR:', JSON.stringify(errorBody, null, 2));
                    detailedError = errorBody.error || errorBody.message || JSON.stringify(errorBody);
                } catch (e) {
                    console.error('No se pudo procesar el JSON del error');
                }
            }
            addNotification('Error: ' + detailedError, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (user?.subscription_tier !== 'pro') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-600">Verificando acceso...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] sm:h-[calc(100vh-160px)] flex flex-col pt-2 sm:pt-4">
            <div className="flex items-center justify-between mb-4 sm:mb-8 px-4">
                <div className="animate-fade-in">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">Tu Skin Coach IA</h1>
                    <p className="text-base-content/60 text-[10px] sm:text-sm font-medium mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Asistente experto en dermocosmética
                    </p>
                </div>
                <div className="hidden xs:block">
                    <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] shadow-sm backdrop-blur-md">
                        Miembro PRO
                    </span>
                </div>
            </div>

            <Card className="flex-grow flex flex-col overflow-hidden mb-6 p-0 border-base-300 shadow-xl rounded-3xl bg-base-100/50 backdrop-blur-sm relative">
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-base-300 bg-base-200/40 backdrop-blur-md flex items-center gap-4 z-10">
                    <div className="w-12 h-12 rounded-2xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center rotate-3 transform transition-transform hover:rotate-0">
                        <i className="iconoir-chat-bubble-check text-primary-content text-2xl"></i>
                    </div>
                    <div>
                        <p className="font-bold text-base text-base-content">Sugerencias del Coach</p>
                        <p className="text-[11px] text-base-content/50 font-medium tracking-wide">
                            Disponible 24/7 para tu piel
                        </p>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-grow overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-transparent custom-scrollbar">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                            style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                            <div
                                className={`max-w-[90%] sm:max-w-[85%] lg:max-w-2xl p-3 sm:p-5 rounded-2xl shadow-sm ${msg.role === 'user'
                                    ? 'bg-primary text-primary-content rounded-tr-none shadow-md shadow-primary/10'
                                    : 'bg-base-100 text-base-content rounded-tl-none border border-base-300/80'
                                    }`}
                            >
                                <p className="text-sm sm:text-[15px] leading-relaxed font-medium whitespace-pre-wrap">
                                    {msg.content}
                                </p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-base-200/50 border border-base-300 p-3 sm:p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 px-4 sm:px-6">
                                <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Disclaimer info */}
                <div className="px-4 sm:px-6 py-2 border-t border-base-300/30 bg-base-200/20">
                    <p className="text-[9px] sm:text-[10px] text-center text-base-content/40 font-medium italic">
                        * Las recomendaciones son exclusivamente cosméticas. Consulta a un asistente inteligente para análisis cosméticos.
                    </p>
                </div>

                {/* Input area */}
                <div className="p-3 sm:p-5 bg-base-200/40 backdrop-blur-md border-t border-base-300">
                    <div className="relative flex items-center gap-2 sm:gap-3">
                        <Input
                            placeholder="Pregunta sobre tu piel..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            className="flex-grow bg-base-100 border-base-300 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-xl py-3 sm:py-4 pl-4 pr-12 text-sm sm:text-base shadow-inner"
                            disabled={isLoading}
                        />
                        <div className="absolute right-1.5 sm:right-2 flex items-center">
                            <Button
                                onClick={handleSend}
                                isLoading={isLoading}
                                disabled={!input.trim()}
                                className="w-9 h-9 sm:w-10 sm:h-10 min-h-0 p-0 flex items-center justify-center rounded-lg bg-primary hover:bg-primary-focus text-primary-content shadow-lg shadow-primary/20 transform active:scale-95 transition-all"
                            >
                                {!isLoading && <i className="iconoir-send text-lg sm:text-xl"></i>}
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ChatPage;
