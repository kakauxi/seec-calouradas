"use client";

import React from 'react';
import { MadeWithDyad } from "./made-with-dyad";

const Footer = () => {
  return (
    <footer className="mt-auto py-8 px-4 border-t border-slate-200 bg-white">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <div className="text-slate-500 text-sm leading-relaxed">
          <p>© 2026 SEEC Desenvolvimento de Software. Todos os direitos reservados.</p>
          <p className="mt-1">É proibida a reprodução total ou parcial sem autorização.</p>
        </div>
        <MadeWithDyad />
      </div>
    </footer>
  );
};

export default Footer;