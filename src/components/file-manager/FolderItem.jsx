import React from 'react';
import FolderCard from './FolderCard';

export default function FolderItem({ folder, ...props }) {
    return <FolderCard folder={folder} {...props} />;
}
