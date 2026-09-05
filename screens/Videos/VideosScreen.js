import React from 'react';
import StatusListScreen from '../Home/StatusListScreen';

export default function VideosScreen(props) {
  return <StatusListScreen {...props} kind="videos" />;
}
