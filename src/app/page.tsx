import { redirect } from 'next/navigation';

export default function Home() {
    // Inicialmente redirigimos al login, ya que la aplicación requiere autenticación
    redirect('/login');
}
