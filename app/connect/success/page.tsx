export default function ConnectSuccessPage() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Pax · Payouts Connected</title>
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
            border: 1px solid rgba(16,185,129,0.2);
            border-radius: 20px;
            padding: 48px 36px;
            max-width: 420px;
            width: 100%;
            text-align: center;
          }
          .icon {
            width: 64px;
            height: 64px;
            background: rgba(16,185,129,0.1);
            border: 1px solid rgba(16,185,129,0.25);
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
            letter-spacing: -0.3px;
          }
          p {
            font-family: -apple-system, sans-serif;
            font-size: 14px;
            color: rgba(237,230,211,0.5);
            line-height: 1.7;
          }
          .badge {
            display: inline-block;
            background: rgba(16,185,129,0.12);
            border: 1px solid rgba(16,185,129,0.25);
            color: #10B981;
            font-family: -apple-system, sans-serif;
            font-size: 12px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 20px;
            margin-bottom: 20px;
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
          <div className="icon">✓</div>
          <div className="badge">PAYOUTS CONNECTED</div>
          <h1>You're all set.</h1>
          <p>
            Your bank account is connected. Upsell earnings from late checkouts and early check-ins
            will be paid out directly to you when you approve requests in the Pax app.
          </p>
          <p className="logo">PAX</p>
        </div>
      </body>
    </html>
  );
}
