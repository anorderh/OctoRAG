import React, { useState } from 'react';

interface ModalProps {
isOpen: boolean;
onClose: () => void;
children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
if (!isOpen) return null;

return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-8 rounded-md shadow-lg relative">
        <button className="absolute top-2 right-2" onClick={onClose}>
        ✖
        </button>
        {children}
    </div>
    </div>
);
}