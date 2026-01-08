import { DailyRoutineStep, HistoryEntry, ProductRecommendation } from '../types';

export const NAV_LINKS = [
  { name: 'Principal', path: '/', icon: 'iconoir-home' },
  { name: 'Rutina Diaria', path: '/routine', icon: 'iconoir-calendar' },
  { name: 'Historial', path: '/history', icon: 'iconoir-history' },
  { name: 'Consejos', path: '/tips', icon: 'iconoir-light-bulb-on' },
  { name: 'Ayuda y Opiniones', path: '/feedback', icon: 'iconoir-chat-bubble-question' },
  { name: 'Perfil', path: '/profile', icon: 'iconoir-user' },
  { name: 'Skin Coach IA', path: '/chat', icon: 'iconoir-chat-bubble-check' },
  { name: 'Recomendaciones', path: '/recommendations', icon: 'iconoir-shopping-bag' },
  { name: 'Suscripción', path: '/subscription', icon: 'iconoir-star' },
  { name: 'Términos de Uso', path: '/terminos', icon: 'iconoir-page' },
];

export const STRIPE_PRICES = {
  MONTHLY: 'price_1SjhRAEfruJcNACvSNcHGpI9', // Plan Mensual €4,99
  ANNUAL: 'price_1SjhzdEfruJcNACvCHJqngpG',  // Plan Anual €39,99
};

export const MOCK_ROUTINE: DailyRoutineStep[] = [
  { id: 'm1', time: 'morning', productType: 'Limpiador', instructions: 'Lava tu cara con un limpiador suave.', completed: false },
  { id: 'm2', time: 'morning', productType: 'Tónico', instructions: 'Aplica un tónico equilibrante.', completed: false },
  { id: 'm3', time: 'morning', productType: 'Hidratante', instructions: 'Usa una hidratante ligera con SPF 30.', completed: false },
  { id: 'e1', time: 'evening', productType: 'Limpiador', instructions: 'Limpia tu rostro para remover impurezas.', completed: false },
  { id: 'e2', time: 'evening', productType: 'Sérum', instructions: 'Aplica un sérum con retinol.', completed: false },
  { id: 'e3', time: 'evening', productType: 'Crema de noche', instructions: 'Usa una crema nutritiva para la noche.', completed: false },
];

export const MOCK_RECOMMENDATIONS: ProductRecommendation[] = [
  { id: 'p1', name: 'Limpiador Facial Suave', brand: 'CeraVe', productType: 'Limpiador', price: 12.99, imageUrl: 'https://picsum.photos/seed/prod1/400/300', affiliateLink: '#', description: 'Ideal para pieles sensibles, limpia sin resecar.' },
  { id: 'p2', name: 'Hidratante Ultra Ligera SPF 30', brand: 'La Roche-Posay', productType: 'Hidratante', price: 25.50, imageUrl: 'https://picsum.photos/seed/prod2/400/300', affiliateLink: '#', description: 'Protección solar diaria con hidratación intensa.' },
  { id: 'p3', name: 'Sérum de Niacinamida 10%', brand: 'The Ordinary', productType: 'Sérum', price: 8.90, imageUrl: 'https://picsum.photos/seed/prod3/400/300', affiliateLink: '#', description: 'Reduce la apariencia de manchas y congestión.' },
  { id: 'p4', name: 'Tónico Exfoliante Glow', brand: 'Pixi', productType: 'Tónico', price: 18.00, imageUrl: 'https://picsum.photos/seed/prod4/400/300', affiliateLink: '#', description: 'Con ácido glicólico para una piel más radiante.' },
  { id: 'p5', name: 'Crema de Noche Reparadora', brand: 'Kiehl\'s', productType: 'Crema de noche', price: 45.00, imageUrl: 'https://picsum.photos/seed/prod5/400/300', affiliateLink: '#', description: 'Despierta con una piel visiblemente restaurada.' },
  { id: 'p6', name: 'Protector Solar Mineral', brand: 'Avène', productType: 'Protector Solar', price: 22.75, imageUrl: 'https://picsum.photos/seed/prod6/400/300', affiliateLink: '#', description: 'Alta protección para pieles intolerantes.' },
];

export const MOCK_HISTORY: HistoryEntry[] = [
  {
    id: 'hist1',
    date: '2023-10-26T10:00:00Z',
    imageUrl: 'https://picsum.photos/seed/face1/200/200',
    analysis: {
      analisis: {
        tipo_piel: 'combination',
        puntuacion: 82,
        edad_aparente: 28,
        caracteristicas: ['Mantén la hidratación en las mejillas.', 'Controla el sebo en la zona T.', 'Usa protector solar a diario.'],
      },
      mensaje_motivador: '¡Vas por buen camino! Tu piel mixta está bajo control.',
      problems: [
        { area: 'Nariz', issue: 'Puntos negros', severity: 'low', recommendation: 'Usa un exfoliante con ácido salicílico 2 veces por semana.' },
        { area: 'Frente', issue: 'Brillo', severity: 'medium', recommendation: 'Aplica una hidratante matificante por la mañana.' },
      ],
      rutina: {
        manana: [
          { paso: 'Limpieza', ingrediente_key: 'limpiador_gel', explicacion: 'Lava tu cara con un limpiador en gel para zona T.' },
          { paso: 'Tónico', ingrediente_key: 'tonico', explicacion: 'Aplica un tónico sin alcohol.' },
          { paso: 'Hidratación', ingrediente_key: 'hidratante_ligera', explicacion: 'Usa una hidratante no comedogénica con SPF 30.' }
        ],
        noche: [
          { paso: 'Doble Limpieza', ingrediente_key: 'aceite_limpiador', explicacion: 'Usa aceite limpiador seguido de tu limpiador en gel.' },
          { paso: 'Tratamiento', ingrediente_key: 'exfoliante_bha', explicacion: 'Aplica exfoliante con ácido salicílico en la nariz (3 veces/semana).' },
          { paso: 'Hidratación', ingrediente_key: 'crema_hidratante', explicacion: 'Usa una crema hidratante en las zonas secas.' }
        ]
      }
    },
    routine: [
      { id: 'h1m1', time: 'morning', productType: 'Limpiador en Gel', instructions: 'Lava tu cara con un limpiador en gel para zona T.', completed: false },
      { id: 'h1m2', time: 'morning', productType: 'Tónico Equilibrante', instructions: 'Aplica un tónico sin alcohol.', completed: false },
      { id: 'h1m3', time: 'morning', productType: 'Hidratante Ligera', instructions: 'Usa una hidratante no comedogénica con SPF 30.', completed: false },
      { id: 'h1e1', time: 'evening', productType: 'Doble Limpieza', instructions: 'Usa aceite limpiador seguido de tu limpiador en gel.', completed: false },
      { id: 'h1e2', time: 'evening', productType: 'Exfoliante BHA', instructions: 'Aplica exfoliante con ácido salicílico en la nariz (3 veces/semana).', completed: false },
      { id: 'h1e3', time: 'evening', productType: 'Crema Hidratante', instructions: 'Usa una crema hidratante en las zonas secas.', completed: false },
    ],
  },
  {
    id: 'hist2',
    date: '2023-09-15T11:30:00Z',
    imageUrl: 'https://picsum.photos/seed/face2/200/200',
    analysis: {
      analisis: {
        tipo_piel: 'dry',
        puntuacion: 75,
        edad_aparente: 30,
        caracteristicas: ['Hidratación intensiva es clave.', 'Evita limpiadores agresivos.', 'Introduce un aceite facial por la noche.'],
      },
      mensaje_motivador: 'Tu piel necesita un extra de amor e hidratación.',
      problems: [
        { area: 'Mejillas', issue: 'Enrojecimiento', severity: 'medium', recommendation: 'Usa productos calmantes con centella asiática.' },
        { area: 'Contorno de ojos', issue: 'Líneas finas', severity: 'low', recommendation: 'Aplica una crema de ojos con ácido hialurónico.' },
      ],
      rutina: {
        manana: [
          { paso: 'Limpieza', ingrediente_key: 'limpiador_cremoso', explicacion: 'Limpia suavemente con un limpiador hidratante.' },
          { paso: 'Tratamiento', ingrediente_key: 'esencia_hidratante', explicacion: 'Aplica una esencia con ácido hialurónico.' },
          { paso: 'Hidratación', ingrediente_key: 'crema_rica', explicacion: 'Usa una crema rica con ceramidas y SPF 50.' }
        ],
        noche: [
          { paso: 'Limpieza', ingrediente_key: 'balsamo_limpiador', explicacion: 'Derrite el maquillaje y las impurezas.' },
          { paso: 'Tratamiento', ingrediente_key: 'serum_calmante', explicacion: 'Aplica un sérum con centella asiática para el enrojecimiento.' },
          { paso: 'Nutrición', ingrediente_key: 'aceite_facial', explicacion: 'Sella la hidratación con 2-3 gotas de aceite facial.' }
        ]
      }
    },
    routine: [
      { id: 'h2m1', time: 'morning', productType: 'Limpiador Cremoso', instructions: 'Limpia suavemente con un limpiador hidratante.', completed: false },
      { id: 'h2m2', time: 'morning', productType: 'Esencia Hidratante', instructions: 'Aplica una esencia con ácido hialurónico.', completed: false },
      { id: 'h2m3', time: 'morning', productType: 'Crema Hidratante Rica', instructions: 'Usa una crema rica con ceramidas y SPF 50.', completed: false },
      { id: 'h2e1', time: 'evening', productType: 'Bálsamo Limpiador', instructions: 'Derrite el maquillaje y las impurezas.', completed: false },
      { id: 'h2e2', time: 'evening', productType: 'Sérum Calmante', instructions: 'Aplica un sérum con centella asiática para el enrojecimiento.', completed: false },
      { id: 'h2e3', time: 'evening', productType: 'Aceite Facial', instructions: 'Sella la hidratación con 2-3 gotas de aceite facial.', completed: false },
    ],
  },
];