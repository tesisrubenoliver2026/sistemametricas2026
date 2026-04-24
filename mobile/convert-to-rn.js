#!/usr/bin/env node
/**
 * Script para convertir componentes de React web a React Native
 * Uso: node convert-to-rn.js <archivo.tsx>
 */

const fs = require('fs');
const path = require('path');

function convertFileToReactNative(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Remover directiva 'use client'
  if (content.includes("'use client'")) {
    content = content.replace(/'use client';?\n?/g, '');
    modified = true;
  }

  // Convertir elementos HTML a React Native
  const htmlToRN = {
    // Contenedores
    '<div': '<View',
    '</div>': '</View>',

    // Texto
    '<p': '<Text',
    '</p>': '</Text>',
    '<h1': '<Text',
    '</h1>': '</Text>',
    '<h2': '<Text',
    '</h2>': '</Text>',
    '<h3': '<Text',
    '</h3>': '</Text>',
    '<h4': '<Text',
    '</h4>': '</Text>',
    '<h5': '<Text',
    '</h5>': '</Text>',
    '<h6': '<Text',
    '</h6>': '</Text>',
    '<span': '<Text',
    '</span>': '</Text>',
    '<label': '<Text',
    '</label>': '</Text>',

    // Botones
    '<button': '<Pressable',
    '</button>': '</Pressable>',

    // Inputs - más complejo, necesita handling especial
    'type="text"': '',
    'type="email"': 'keyboardType="email-address"',
    'type="number"': 'keyboardType="numeric"',
    'type="password"': 'secureTextEntry={true}',

    // Eventos
    'onClick={': 'onPress={',
    'onChange={(e)': 'onChangeText={(text)',
    'e.target.value': 'text',
    'onChange={e => setSearch(e.target.value)': 'onChangeText={setSearch',
    'onChange={(e) => setSearch(e.target.value)': 'onChangeText={setSearch',
  };

  for (const [htmlTag, rnTag] of Object.entries(htmlToRN)) {
    if (content.includes(htmlTag)) {
      content = content.replace(new RegExp(htmlTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), rnTag);
      modified = true;
    }
  }

  // Convertir <input> a <TextInput>
  if (content.includes('<input')) {
    content = content.replace(/<input/g, '<TextInput');
    modified = true;
  }

  // Convertir <select> a <Picker> (comentado porque Picker necesita configuración especial)
  // Dejarlo como comentario para revisión manual
  if (content.includes('<select')) {
    console.warn(`⚠️  Archivo contiene <select>. Necesita conversión manual a Picker o componente personalizado.`);
  }

  // Convertir <table> (comentado porque necesita conversión manual compleja)
  if (content.includes('<table')) {
    console.warn(`⚠️  Archivo contiene <table>. Necesita conversión manual a View/ScrollView.`);
  }

  // Actualizar imports
  const needsView = content.includes('<View');
  const needsText = content.includes('<Text');
  const needsPressable = content.includes('<Pressable');
  const needsTextInput = content.includes('<TextInput');
  const needsScrollView = content.includes('ScrollView');

  const rnImports = [];
  if (needsView) rnImports.push('View');
  if (needsText) rnImports.push('Text');
  if (needsPressable) rnImports.push('Pressable');
  if (needsTextInput) rnImports.push('TextInput');
  if (needsScrollView) rnImports.push('ScrollView');

  if (rnImports.length > 0) {
    // Verificar si ya existe import de react-native
    const rnImportRegex = /import\s+{([^}]+)}\s+from\s+['"]react-native['"]/;
    const match = content.match(rnImportRegex);

    if (match) {
      // Agregar nuevos imports a los existentes
      const existingImports = match[1].split(',').map(s => s.trim());
      const allImports = [...new Set([...existingImports, ...rnImports])];
      content = content.replace(rnImportRegex, `import { ${allImports.join(', ')} } from 'react-native'`);
    } else {
      // Agregar nuevo import de react-native
      const importStatement = `import { ${rnImports.join(', ')} } from 'react-native';\n`;
      content = content.replace(/(import.*from\s+['"]react['"];?\n)/, `$1${importStatement}`);
    }
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Convertido: ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  Sin cambios: ${filePath}`);
    return false;
  }
}

// Procesar archivo o directorio
const target = process.argv[2];

if (!target) {
  console.error('❌ Uso: node convert-to-rn.js <archivo.tsx o directorio>');
  process.exit(1);
}

if (fs.statSync(target).isDirectory()) {
  // Procesar todos los archivos .tsx en el directorio
  const files = fs.readdirSync(target, { recursive: true })
    .filter(f => f.endsWith('.tsx'))
    .map(f => path.join(target, f));

  let converted = 0;
  files.forEach(file => {
    if (convertFileToReactNative(file)) converted++;
  });

  console.log(`\n📊 Total: ${files.length} archivos, ${converted} convertidos`);
} else {
  convertFileToReactNative(target);
}
