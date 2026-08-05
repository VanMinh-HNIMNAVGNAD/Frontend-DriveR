import React from 'react';
import FileCard from './FileCard';

export default function FileItem({ file, ...props }) {
    return <FileCard file={file} {...props} />;
}
