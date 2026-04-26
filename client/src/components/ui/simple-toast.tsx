import React from 'react';

export function SimpleToast({message}) {
  return (
    <div className="p-4 rounded-md bg-green-500 text-white">
      {message}
    </div>
  );
}