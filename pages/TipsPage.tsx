import React from 'react';
import Card from '../components/ui/Card';

const TipItem: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <li className="flex items-start">
        <i className={`iconoir-${icon} h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0`}></i>
        <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{children}</p>
        </div>
    </li>
);

const TipsPage = () => {
    return (
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content mb-2">Consejos para una Piel Saludable</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">Una colección de buenas prácticas para cuidar tu piel todos los días.</p>

            <Card>
                <ul className="space-y-4">
                    <TipItem icon="droplet" title="Hidratación es clave">Bebe suficiente agua durante el día para mantener tu piel hidratada desde adentro.</TipItem>
                    <TipItem icon="sun-light" title="Protección solar diaria">No salgas sin protector solar, incluso en días nublados. Es tu mejor defensa contra el envejecimiento prematuro.</TipItem>
                    <TipItem icon="wash" title="La limpieza es fundamental">Lava tu rostro dos veces al día para eliminar impurezas, pero evita usar agua muy caliente que pueda resecar tu piel.</TipItem>
                    <TipItem icon="bed" title="Duerme lo suficiente">Un buen descanso es vital. Tu piel se repara y regenera mientras duermes.</TipItem>
                    <TipItem icon="apple" title="Cuida tu alimentación">Una dieta balanceada rica en antioxidantes se reflejará en la salud de tu piel.</TipItem>
                    <TipItem icon="hand-prohibited" title="Evita tocar tu rostro">Tus manos acumulan suciedad y bacterias que pueden obstruir los poros y causar brotes.</TipItem>
                    <TipItem icon="spark" title="Exfolia con moderación">Elimina las células muertas 1-2 veces por semana para una piel más luminosa. No te excedas.</TipItem>
                    <TipItem icon="peace-hand" title="Maneja el Estrés">El estrés crónico puede desencadenar brotes y otros problemas cutáneos. Encuentra formas saludables de relajarte.</TipItem>
                    <TipItem icon="brush-alt" title="Limpia tus Herramientas">Lava tus brochas de maquillaje y fundas de almohada regularmente para eliminar bacterias que causan acné.</TipItem>
                    <TipItem icon="running" title="Haz Ejercicio Regularmente">La actividad física aumenta el flujo sanguíneo, ayudando a nutrir las células de la piel y a mantenerlas vitales.</TipItem>
                    <TipItem icon="temperature" title="Usa Agua Tibia">El agua muy caliente puede eliminar los aceites naturales de tu piel, causando sequedad e irritación. Prefiere siempre agua tibia.</TipItem>
                    <TipItem icon="feather" title="Sé Gentil con tu Piel">Evita frotar o estirar tu piel con fuerza, especialmente alrededor de los ojos. Trátala con suavidad al limpiar y aplicar productos.</TipItem>
                    <TipItem icon="beaker" title="Prueba los Productos Nuevos">Antes de aplicar un producto nuevo en todo tu rostro, haz una prueba en una pequeña área (como detrás de la oreja) para descartar reacciones alérgicas.</TipItem>
                    <TipItem icon="refresh-double" title="Sé Constante con tu Rutina">La constancia es la clave para ver resultados. Sigue tu rutina diaria, incluso cuando no veas cambios inmediatos.</TipItem>
                    <TipItem icon="pillow" title="Cambia tus Fundas de Almohada">Cámbialas al menos una vez por semana para evitar la acumulación de aceites, bacterias y sudor que pueden causar brotes.</TipItem>
                    <TipItem icon="user-love" title="No Olvides tu Cuello">La piel de tu cuello y escote es delicada y también muestra signos de envejecimiento. Extiende tus productos a estas áreas.</TipItem>
                    <TipItem icon="sort" title="Aplica los Productos en Orden">El orden correcto (generalmente de más ligero a más denso) asegura que cada producto se absorba y funcione eficazmente.</TipItem>
                    <TipItem icon="report-columns" title="Escucha a tu Piel">Las necesidades de tu piel pueden cambiar. Aprende a identificar si está seca, grasa o irritada y ajusta tu rutina en consecuencia.</TipItem>
                    <TipItem icon="prohibition" title="Limita el Azúcar y los Lácteos">Algunos estudios sugieren que una dieta alta en azúcar y lácteos puede empeorar el acné. Modera su consumo.</TipItem>
                    <TipItem icon="eye-alt" title="Usa Contorno de Ojos">La piel del contorno de los ojos es más delgada y delicada. Utiliza un producto específico para esta zona.</TipItem>
                    <TipItem icon="lips" title="Hidrata También tus Labios">No olvides aplicar un bálsamo labial con SPF para proteger tus labios del sol y mantenerlos suaves.</TipItem>
                    <TipItem icon="calendar-remove" title="Revisa la Fecha de Caducidad">Los productos de belleza caducan. Usarlos después de su fecha puede ser ineficaz o incluso dañino para tu piel.</TipItem>
                    <TipItem icon="warning-triangle" title="No Exprimas los Granos">Resiste la tentación. Explotar los granos puede causar cicatrices, infecciones y empeorar la inflamación.</TipItem>
                    <TipItem icon="towel" title="Usa una Toalla Limpia para el Rostro">Utiliza una toalla exclusiva y limpia para secar tu rostro. Cámbiala con frecuencia para evitar la propagación de bacterias.</TipItem>
                    <TipItem icon="smartphone-device" title="Limpia la Pantalla de tu Móvil">Tu teléfono acumula suciedad y bacterias. Límpialo regularmente para evitar transferirlos a tu piel y causar brotes.</TipItem>
                </ul>
            </Card>
        </div>
    );
};

export default TipsPage;