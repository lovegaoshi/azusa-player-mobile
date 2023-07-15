import React from 'react';
import useAAPlayback from './hooks/useAAPlayback';

const AzusaPlayer = (props: any) => {
  const AAPlayback = useAAPlayback();

  return <>{props.children}</>;
};

export default AzusaPlayer;
