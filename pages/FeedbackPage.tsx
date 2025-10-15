import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useNotification } from '../context/NotificationContext';
import { Accordion, AccordionItem } from '../components/ui/Accordion';

const FeedbackPage = () => {
  const [messageType, setMessageType] = useState('Sugerencia');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotification();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      addNotification('Por favor, escribe un mensaje.', 'error');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Feedback submitted:', { messageType, message });
      setIsSubmitting(false);
      setMessage('');
      setMessageType('Sugerencia');
      addNotification('¡Gracias! Tu opinión ha sido enviada.', 'success');
    }, 1000);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-base-content mb-2">Ayuda y Opiniones</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">¿Tienes alguna pregunta o sugerencia? Estamos aquí para ayudarte.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-bold text-base-content">Envía tu Opinión o Problema</h2>
            <p className="text-sm text-gray-500">
              Nos encantaría saber qué piensas. Usa este formulario para enviar sugerencias, reportar errores o hacer preguntas.
            </p>
            
            <div>
              <label htmlFor="messageType" className="block text-sm font-medium text-base-content mb-1">
                Tipo de Mensaje
              </label>
              <select
                id="messageType"
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                className="block w-full px-4 py-2 bg-base-100 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-focus sm:text-sm"
              >
                <option>Sugerencia</option>
                <option>Reportar un Error</option>
                <option>Pregunta</option>
                <option>Otro</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-base-content mb-1">
                Tu Mensaje
              </label>
              <textarea
                id="message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                className="block w-full px-4 py-2 border border-base-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-focus sm:text-sm"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" isLoading={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </form>
        </Card>
        
        <Card>
          <h2 className="text-xl font-bold text-base-content mb-4">Preguntas Frecuentes</h2>
          <Accordion>
            <AccordionItem title="¿Cómo obtengo los mejores resultados en el análisis?">
              <p>Para un análisis preciso, asegúrate de usar una foto clara, de frente, sin maquillaje y con buena iluminación natural. Evita las sombras fuertes sobre tu rostro.</p>
            </AccordionItem>
            <AccordionItem title="¿Con qué frecuencia debo analizar mi piel?">
              <p>Recomendamos realizar un análisis una vez al mes para seguir tu progreso. Si estás probando un nuevo producto o rutina, puedes hacerlo cada dos semanas para observar los cambios.</p>
            </AccordionItem>
            <AccordionItem title="¿Mis fotos son privadas y seguras?">
              <p>Sí, tu privacidad es nuestra prioridad. Las imágenes se procesan de forma segura para el análisis y no se comparten con terceros. Consulta nuestra política de privacidad para más detalles.</p>
            </AccordionItem>
            <AccordionItem title="El análisis falló, ¿qué debo hacer?">
              <p>Si el análisis falla, primero verifica tu conexión a internet. Intenta con una foto diferente que cumpla con las recomendaciones. Si el problema persiste, es posible que nuestro servicio esté experimentando una alta demanda. Inténtalo de nuevo más tarde o contacta con soporte usando el formulario.</p>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackPage;
