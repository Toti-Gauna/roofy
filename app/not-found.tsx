import './globals.css';
import { routing, localeTags } from '@/i18n/routing';
import { BASE_PATH } from '@/lib/env';
import es from '@/messages/es.json';
import en from '@/messages/en.json';
import pt from '@/messages/pt.json';

const copy = { es: es.notFound, en: en.notFound, pt: pt.notFound };

// Static export: this renders out/404.html, shared by every language, so it speaks all three.
export default function NotFound() {
  return (
    <html lang="es" className="bg-void">
      <head>
        <title>404</title>
        <meta name="robots" content="noindex" />
      </head>
      <body className="bg-void text-fg">
        <main className="container-x grid min-h-dvh content-center gap-8">
          {routing.locales.map((l) => (
            <section key={l} lang={localeTags[l]}>
              <h1 className="display text-4xl">{copy[l].title}</h1>
              <a href={`${BASE_PATH}/${l}/`} className="btn-ghost mt-4">
                {copy[l].back}
              </a>
            </section>
          ))}
        </main>
      </body>
    </html>
  );
}
