import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon, PackageIcon, LayersIcon, CartIcon, MessageIcon, StarIcon,
  TagIcon, MailIcon, BellIcon, ListIcon, SettingsIcon, MenuIcon,
  CloseIcon, LogOutIcon, EyeIcon, ChevronRight, UserIcon
} from '../../components/common/Icons';

const NAV = [
  { to:'/admin',             icon:<HomeIcon size={17}/>,    label:'Dashboard',  end:true },
  { to:'/admin/products',    icon:<PackageIcon size={17}/>, label:'Products' },
  { to:'/admin/categories',  icon:<LayersIcon size={17}/>,  label:'Categories' },
  { to:'/admin/orders',      icon:<CartIcon size={17}/>,    label:'Orders' },
  { to:'/admin/reviews',     icon:<StarIcon size={17}/>,    label:'Reviews' },
  { to:'/admin/offers',      icon:<TagIcon size={17}/>,     label:'Offers' },
  { to:'/admin/messages',    icon:<MessageIcon size={17}/>, label:'Messages' },
  { to:'/admin/newsletter',  icon:<MailIcon size={17}/>,    label:'Newsletter' },
  { to:'/admin/notices',     icon:<BellIcon size={17}/>,    label:'Notices' },
  { to:'/admin/pages',       icon:<ListIcon size={17}/>,    label:'Pages' },
  { to:'/admin/settings',    icon:<SettingsIcon size={17}/>,label:'Settings' },
  { to:'/admin/profile',     icon:<UserIcon size={17}/>,    label:'My Profile' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sideW = collapsed ? 60 : 230;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: collapsed ? '1rem 0' : '1rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'space-between', minHeight: 64 }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg,var(--primary),var(--accent))', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 15 }}>T</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, fontFamily: 'var(--font-heading)' }}>TechMart</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, letterSpacing: '0.06em' }}>ADMIN PANEL</div>
            </div>
          </div>
        )}
        <button onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {collapsed ? <ChevronRight size={14} /> : <CloseIcon size={13} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.5rem 0', overflowY: 'auto' }}>
        {NAV.map(({ to, icon, label, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '11px 0' : '10px 14px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
              background: isActive ? 'rgba(66,189,237,0.18)' : 'transparent',
              borderLeft: `3px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
              textDecoration: 'none', fontSize: 13.5, fontWeight: isActive ? 700 : 400,
              transition: 'all 0.15s', cursor: 'pointer',
            })}>
            <span style={{ flexShrink: 0 }}>{icon}</span>
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: collapsed ? '0.75rem 0' : '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {!collapsed && (
          <div style={{ marginBottom: '0.6rem' }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, justifyContent: collapsed ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
          <a href="/" target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.8)', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, textDecoration: 'none' }}>
            <EyeIcon size={13} /> {!collapsed && 'View Store'}
          </a>
          {!collapsed && (
            <button onClick={() => { logout(); navigate('/'); }}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(220,38,38,0.2)', border: 'none', color: '#fca5a5', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font)' }}>
              <LogOutIcon size={13} /> Logout
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
      {/* Desktop sidebar */}
      <aside style={{ width: sideW, background: 'var(--nav-bg)', flexShrink: 0, display: 'flex', flexDirection: 'column', transition: 'width 0.25s', position: 'sticky', top: 0, height: '100vh', overflowX: 'hidden' }}
        className="desktop-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }} onClick={() => setMobileOpen(false)} />
          <div style={{ position: 'fixed', top: 0, left: 0, width: 240, height: '100vh', background: 'var(--nav-bg)', zIndex: 200, display: 'flex', flexDirection: 'column', boxShadow: '4px 0 20px rgba(0,0,0,0.3)' }}>
            <SidebarContent />
          </div>
        </>
      )}

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '0 1.25rem', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Mobile menu btn */}
            <button onClick={() => setMobileOpen(true)}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--text-mid)', display: 'flex', alignItems: 'center' }}
              className="mobile-menu-btn">
              <MenuIcon size={18} />
            </button>
            <div style={{ fontSize: 14, color: 'var(--text-mid)' }}>
              Welcome, <strong style={{ color: 'var(--text-dark)' }}>{user?.name?.split(' ')[0]}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-light)', display: 'none' }} className="show-md">{new Date().toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })}</span>
            <div style={{ width: 34, height: 34, background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: 14, fontFamily: 'var(--font-heading)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '1.5rem', overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .show-md { display: inline !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}
