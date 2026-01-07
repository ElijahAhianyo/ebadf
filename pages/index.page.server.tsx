import React from 'react';
import AppServer from '../src/ssr/App.server';

export const Page = () => {
  // Render the full app for the root page; the AppServer uses StaticRouter so it
  // will render the appropriate routes.
  return <AppServer />;
};

export async function onRenderHtml(pageContext: any) {
  // Delegate rendering to our server entry which returns { documentHtml, pageContext }
  const { render } = await import('../server/entry-server');
  return render(pageContext);
}

export default { Page };
