import { render as renderFromEntry } from './entry-server';

export async function render(pageContext: any) {
  // Delegate to the entry-server render implementation
  return renderFromEntry(pageContext);
}

export default { render };
