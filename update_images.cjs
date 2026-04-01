const fs = require('fs');

const file = 'client/src/data/menuData.ts';
let content = fs.readFileSync(file, 'utf8');

const imageMap = {
  'drink-3': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&auto=format&fit=crop', // Iced Coffee
  'drink-4': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop', // Hot Coffee
  'drink-5': 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=500&auto=format&fit=crop', // Latte
  'drink-6': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&auto=format&fit=crop', // Cappuccino
  'drink-7': 'https://images.unsplash.com/photo-1589733955437-56163351ac66?w=500&auto=format&fit=crop', // Watermelon
  'drink-8': 'https://images.unsplash.com/photo-1620916297397-cba11eb668fd?w=500&auto=format&fit=crop', // Mango
  'drink-9': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=500&auto=format&fit=crop', // Mixed berry
  'drink-10': 'https://images.unsplash.com/photo-1553530666-ba11a90a2b53?w=500&auto=format&fit=crop', // Strawberry yogurt
  'drink-11': 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500&auto=format&fit=crop', // Blue Hawaiian
  'drink-12': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop', // Peach Soda
  'drink-13': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&auto=format&fit=crop', // Lychee
  'drink-14': 'https://images.unsplash.com/photo-1572490122747-3968b75bb69c?w=500&auto=format&fit=crop', // Korean strawberry milk
  'drink-15': 'https://images.unsplash.com/photo-1614315584558-96f1d2bc07ee?w=500&auto=format&fit=crop', // Pink milk
  'drink-16': 'https://images.unsplash.com/photo-1626359196859-97af28a05156?w=500&auto=format&fit=crop', // Caramel milk
  'drink-17': 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500&auto=format&fit=crop', // Chocolate
  'drink-18': 'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=500&auto=format&fit=crop', // Cocoa
  'drink-19': 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&auto=format&fit=crop', // Fruit tea
  'drink-20': 'https://images.unsplash.com/photo-1558857563-b371032b5085?w=500&auto=format&fit=crop', // Thai tea
  'drink-21': 'https://images.unsplash.com/photo-1582782729904-8bba23bce3f6?w=500&auto=format&fit=crop', // Hojicha
  'drink-22': 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=500&auto=format&fit=crop', // Matcha
  'drink-23': 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=500&auto=format&fit=crop', // Americano
  'drink-24': 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&auto=format&fit=crop'  // Espresso
};

for (let i = 3; i <= 24; i++) {
  let id = `drink-${i}`;
  let img = imageMap[id];
  if (!img) continue;

  let blockRegex = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?image:\\s*')[^']+(')`);
  content = content.replace(blockRegex, `$1${img}$2`);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Images updated successfully!');
