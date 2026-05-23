import { BottomNav } from './BottomNav';

export const Layout = ({ children, hideNav = false }) => (
  <div className="min-h-screen pb-20">
    {children}
    {!hideNav && <BottomNav />}
  </div>
);
