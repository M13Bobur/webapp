import { BottomNav } from './BottomNav';
import { Toast } from './Toast';

export const Layout = ({ children, hideNav = false }) => (
  <div className="min-h-screen pb-20">
    <Toast />
    {children}
    {!hideNav && <BottomNav />}
  </div>
);
