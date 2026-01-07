import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import AppServer from '../src/ssr/App.server';
import { dangerouslySkipEscape } from 'vike/server';

export async function render(pageContext: any) {
  const url = pageContext.urlOriginal || pageContext.route || '/';

  const appHtml = renderToString(
    <StaticRouter location={url}>
      <AppServer />
    </StaticRouter>
  );

  // Use the existing index.html as a template and inject the rendered app into #root
  const templatePath = path.resolve(process.cwd(), 'index.html');
  let template = fs.readFileSync(templatePath, 'utf8');

  template = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

  // Return a safely-wrapped HTML string (vite-plugin-ssr expects escapeInject or dangerouslySkipEscape)
  return { documentHtml: dangerouslySkipEscape(template) };
}

export { render as default };
