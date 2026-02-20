export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1B1B2E 100%)',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Decorative background blobs */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(30,136,217,0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-15%',
                left: '-5%',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            {children}
        </div>
    )
}
