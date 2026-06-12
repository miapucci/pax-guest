'use client';
import { useEffect } from 'react';

export default function ConnectRefreshPage() {
  useEffect(() => {
    // The onboarding link expired — instruct user to return to the app and try again
  }, []);

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Pax · Link Expired</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            background: #09080c;
            font-family: Georgia, serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }
          .card {
            background: #13111a;
            border: 1px solid rgba(248,113,113,0.2);
            border-radius: 20px;
            padding: 48px 36px;
            max-width: 420px;
            width: 100%;
            text-align: center;
          }
          .icon {
            width: 64px;
            height: 64px;
            background: rgba(248,113,113,0.08);
            border: 1px solid rgba(248,113,113,0.2);
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            font-size: 28px;
          }
          h1 {
            font-size: 26px;
            font-weight: 400;
            color: #EDE6D3;
            margin-bottom: 12px;
          }
          p {
            font-family: -apple-system, sans-serif;
            font-size: 14px;
            color: rgba(237,230,211,0.5);
            line-height: 1.7;
          }
          .logo {
            font-size: 13px;
            color: rgba(201,169,110,0.5);
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-top: 32px;
          }
        `}</style>
      </head>
      <body>
        <div className="card">
          <div className="icon">↻</div>
          <h1>Link expired.</h1>
          <p>
            This setup link has expired. Return to the Pax app and tap
            "Connect Bank Account" again to get a fresh link.
          </p>
          <p className="logo">PAX</p>
        </div>
      </body>
    </html>
  );
}
