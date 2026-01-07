import React from 'react';
import AppServer from '../../src/ssr/App.server';

export async function onBeforeRender(pageContext: any) {
  const { params } = pageContext;
  const url = `/blog/${params?.slug || ''}`;
  // Provide the URL as `route` so we avoid clobbering any existing read-only `url` getter
  return { pageContext: { route: url } };
}

export const Page = () => {
  return <AppServer />;
};

export default { Page };

export async function onRenderHtml(pageContext: any) {
  const { render } = await import('../../server/entry-server');
  return render(pageContext);
}
