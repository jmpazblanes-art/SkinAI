import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useNotification } from '../context/NotificationContext';
import LazyImage from '../components/ui/LazyImage';

interface Reminder {
  enabled: boolean;
  time: string; // HH:mm format
}

const ReminderControl: React.FC<{
  title: string;
  description: string;
  reminder: Reminder;
  onToggle: () => void;
  onTimeChange: (time: string) => void;
}> = ({ title, description, reminder, onToggle, onTimeChange }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b border-base-300/60 last:border-b-0">
    <div>
      <p className="font-semibold text-base-content">{title}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
    <div className="flex items-center gap-4 mt-3 sm:mt-0">
      <input
        type="time"
        value={reminder.time}
        onChange={(e) => onTimeChange(e.target.value)}
        disabled={!reminder.enabled}
        className="px-2 py-1 border border-base-300 rounded-md bg-base-100 disabled:opacity-50"
      />
      <button
        onClick={onToggle}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${reminder.enabled ? 'bg-primary' : 'bg-gray-300'
          }`}
      >
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${reminder.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
      </button>
    </div>
  </div>
);

const ProfilePage = () => {
  const { user, updateProfilePicture, activateProCode } = useAuth();
  const { addNotification } = useNotification();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [birthDate, setBirthDate] = useState(user?.birthDate || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [promoCode, setPromoCode] = useState('');
  const [reminders, setReminders] = useState({
    morning: { enabled: false, time: '08:00' },
    evening: { enabled: false, time: '21:00' },
  });

  const handleActivateCode = async () => {
    if (!promoCode) return;

    const success = await activateProCode(promoCode);
    if (success) {
      addNotification('¡Felicidades! Has activado el modo PRO con éxito.', 'success');
      setPromoCode('');
    } else {
      addNotification('Código no válido o ya activado.', 'error');
    }
  };

  useEffect(() => {
    // Load reminder settings from local storage
    const savedSettings = localStorage.getItem('reminderSettings');
    if (savedSettings) {
      setReminders(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    // Save reminder settings to local storage whenever they change
    localStorage.setItem('reminderSettings', JSON.stringify(reminders));
  }, [reminders]);

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving changes:', { name, email, birthDate });
    addNotification('Perfil actualizado con éxito.', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification('Contraseña cambiada correctamente (simulación).', 'success');
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
    const MAX_SIZE_MB = 2;

    if (!ALLOWED_TYPES.includes(file.type)) {
      addNotification("Formato de archivo no válido. Sube JPEG, PNG o GIF.", 'error');
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      addNotification(`El archivo es demasiado grande. El tamaño máximo es ${MAX_SIZE_MB}MB.`, 'error');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateProfilePicture(dataUrl);
      addNotification('Foto de perfil actualizada.', 'success');
    };
    reader.onerror = () => {
      addNotification('No se pudo leer el archivo de imagen.', 'error');
    };
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      addNotification('Este navegador no soporta notificaciones de escritorio.', 'error');
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        addNotification('Permiso de notificaciones concedido.', 'success');
        return true;
      }
    }
    addNotification('Permiso de notificaciones denegado.', 'error');
    return false;
  };

  const handleReminderToggle = async (type: 'morning' | 'evening') => {
    const isEnabling = !reminders[type].enabled;
    if (isEnabling) {
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) {
        return; // Don't enable if permission was denied
      }
    }
    setReminders(prev => ({
      ...prev,
      [type]: { ...prev[type], enabled: isEnabling },
    }));
  };

  const handleTimeChange = (type: 'morning' | 'evening', time: string) => {
    setReminders(prev => ({
      ...prev,
      [type]: { ...prev[type], time },
    }));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tu Perfil</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSaveChanges} className="space-y-6">
              <h2 className="text-xl font-bold">Datos Personales</h2>
              <Input label="Nombre completo" id="name" type="text" value={name} onChange={e => setName(e.target.value)} />
              <Input label="Email" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              <Input label="Fecha de nacimiento" id="birthDate" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
              <div className="pt-4">
                <Button type="submit">Guardar Cambios</Button>
              </div>
            </form>
          </Card>

          <Card className="mt-8">
            <h2 className="text-xl font-bold mb-2">Recordatorios de Rutina</h2>
            <p className="text-sm text-gray-500 mb-4">Recibe una notificación para ayudarte a mantener la constancia con tu rutina.</p>
            <ReminderControl
              title="Recordatorio Matutino"
              description="Para tu rutina de la mañana."
              reminder={reminders.morning}
              onToggle={() => handleReminderToggle('morning')}
              onTimeChange={(time) => handleTimeChange('morning', time)}
            />
            <ReminderControl
              title="Recordatorio Nocturno"
              description="Para tu rutina de la noche."
              reminder={reminders.evening}
              onToggle={() => handleReminderToggle('evening')}
              onTimeChange={(time) => handleTimeChange('evening', time)}
            />
          </Card>

          <Card className="mt-8">
            <h2 className="text-xl font-bold mb-2">Canjear Código</h2>
            <p className="text-sm text-gray-500 mb-4">Si tienes un código de acceso o promoción, introdúcelo aquí para activar funciones especiales.</p>
            <div className="flex gap-4">
              <div className="flex-grow">
                <Input
                  label=""
                  id="promo-code"
                  placeholder="Introduce tu código"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
              </div>
              <div className="pt-1">
                <Button variant="secondary" onClick={handleActivateCode}>Activar</Button>
              </div>
            </div>
          </Card>

          <Card className="mt-8">
            <form onSubmit={handleChangePassword}>
              <h2 className="text-xl font-bold mb-4">Seguridad</h2>
              <div className="space-y-4">
                <Input label="Contraseña actual" id="current-password" type="password" />
                <Input label="Nueva contraseña" id="new-password" type="password" />
                <Input label="Confirmar nueva contraseña" id="confirm-password" type="password" />
              </div>
              <div className="pt-6">
                <Button type="submit">Cambiar Contraseña</Button>
              </div>
            </form>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="text-center">
            <h2 className="text-xl font-bold mb-4">Foto de Perfil</h2>
            <LazyImage src={user?.profilePictureUrl} alt="Foto de perfil" className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleProfilePictureChange}
              accept="image/jpeg, image/png, image/gif"
              className="hidden"
            />
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>Cambiar foto</Button>
          </Card>
          <Card className="mt-8 border-red-300">
            <h2 className="text-xl font-bold text-red-700 mb-2">Zona de Peligro</h2>
            <p className="text-gray-600 mb-4">Esta acción es irreversible. Todos tus datos serán eliminados permanentemente.</p>
            <Button className="bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white w-full">Borrar mi cuenta</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;