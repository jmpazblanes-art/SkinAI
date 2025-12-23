#!/usr/bin/env node

/**
 * Script de validación de variables de entorno
 * Verifica que todas las variables requeridas estén configuradas
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validando configuración de variables de entorno...\n');

// Leer .env.local
const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ ERROR: No se encontró el archivo .env.local');
  console.log('📝 Copia .env.example a .env.local y configura tus variables:');
  console.log('   cp .env.example .env.local\n');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n');

// Variables requeridas
const requiredVars = {
  'VITE_SUPABASE_URL': {
    pattern: /^https:\/\/[a-z]+\.supabase\.co$/,
    example: 'https://xxxxx.supabase.co',
    description: 'URL de tu proyecto Supabase'
  },
  'VITE_SUPABASE_ANON_KEY': {
    pattern: /^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Anon/Public key de Supabase'
  },
  'VITE_GEMINI_API_KEY': {
    pattern: /^AIza[A-Za-z0-9_-]{35}$/,
    example: 'AIzaSy...',
    description: 'API Key de Google Gemini'
  }
};

// Variables opcionales
const optionalVars = {
  'VITE_STRIPE_PUBLIC_KEY': {
    pattern: /^pk_(test|live)_[A-Za-z0-9]+$/,
    example: 'pk_test_...',
    description: 'Public key de Stripe (opcional)'
  }
};

// Parsear variables
const envVars = {};
lines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim();
    if (key && value) {
      envVars[key] = value;
    }
  }
});

let hasErrors = false;
let hasWarnings = false;

// Validar variables requeridas
console.log('📋 Variables requeridas:\n');
Object.entries(requiredVars).forEach(([varName, config]) => {
  const value = envVars[varName];

  if (!value) {
    console.error(`❌ ${varName}: NO CONFIGURADA`);
    console.log(`   📝 ${config.description}`);
    console.log(`   Ejemplo: ${varName}=${config.example}\n`);
    hasErrors = true;
  } else if (value.includes('your_') || value.includes('tu_')) {
    console.error(`❌ ${varName}: VALOR DE PLACEHOLDER`);
    console.log(`   📝 Reemplaza el valor placeholder con tu ${config.description}\n`);
    hasErrors = true;
  } else if (!config.pattern.test(value)) {
    console.warn(`⚠️  ${varName}: FORMATO POSIBLEMENTE INCORRECTO`);
    console.log(`   Valor actual: ${value.substring(0, 20)}...`);
    console.log(`   Formato esperado: ${config.example}\n`);
    hasWarnings = true;
  } else {
    console.log(`✅ ${varName}: OK`);
  }
});

// Validar variables opcionales
console.log('\n📋 Variables opcionales:\n');
Object.entries(optionalVars).forEach(([varName, config]) => {
  const value = envVars[varName];

  if (!value) {
    console.log(`ℹ️  ${varName}: No configurada (opcional)`);
  } else if (value.includes('your_') || value.includes('tu_')) {
    console.warn(`⚠️  ${varName}: VALOR DE PLACEHOLDER`);
    console.log(`   📝 ${config.description}\n`);
    hasWarnings = true;
  } else if (!config.pattern.test(value)) {
    console.warn(`⚠️  ${varName}: FORMATO POSIBLEMENTE INCORRECTO`);
    console.log(`   Formato esperado: ${config.example}\n`);
    hasWarnings = true;
  } else {
    console.log(`✅ ${varName}: OK`);
  }
});

// Verificar que no haya variables peligrosas
console.log('\n🔒 Verificando seguridad:\n');
const dangerousVars = ['SUPABASE_SERVICE_ROLE_KEY', 'STRIPE_SECRET_KEY', 'SERVICE_ROLE'];
let hasDangerousVars = false;

dangerousVars.forEach(varName => {
  if (envVars[varName]) {
    console.error(`❌ PELIGRO: ${varName} está configurada en .env.local`);
    console.log(`   Esta clave NO DEBE estar en el frontend!`);
    console.log(`   Elimínala inmediatamente.\n`);
    hasErrors = true;
    hasDangerousVars = true;
  }
});

if (!hasDangerousVars) {
  console.log('✅ No se encontraron claves sensibles peligrosas');
}

// Verificar .gitignore
console.log('\n📁 Verificando .gitignore:\n');
const gitignorePath = path.join(__dirname, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  if (gitignoreContent.includes('.env.local')) {
    console.log('✅ .env.local está en .gitignore');
  } else {
    console.error('❌ .env.local NO está en .gitignore');
    console.log('   Esto podría exponer tus credenciales!\n');
    hasErrors = true;
  }
} else {
  console.warn('⚠️  No se encontró .gitignore');
  hasWarnings = true;
}

// Resumen
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.error('\n❌ VALIDACIÓN FALLIDA');
  console.log('\nPor favor corrige los errores antes de continuar.');
  console.log('Lee el archivo README.md para más información.\n');
  process.exit(1);
} else if (hasWarnings) {
  console.warn('\n⚠️  VALIDACIÓN CON ADVERTENCIAS');
  console.log('\nRevisa las advertencias antes de continuar.\n');
  process.exit(0);
} else {
  console.log('\n✅ VALIDACIÓN EXITOSA');
  console.log('\n¡Tu configuración está lista! Puedes ejecutar:');
  console.log('   npm run dev\n');
  process.exit(0);
}
