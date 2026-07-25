import { memo } from 'react';

function RawMarkup({ html }) {
  return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default memo(RawMarkup);
