# Pet interativo (React)

Alienígena peludo que vive por cima da página: olha pro mouse, balança as antenas, passeia sozinho,
pode ser arrastado, reage ao clique e dorme quando fica parado.

## Rodar o exemplo

```bash
npm install
npm run dev      # http://localhost:5173
```

## Usar em outro projeto React

1. Instale a dependência: `npm i framer-motion`
2. Copie para o projeto dela:
   - `src/Pet.jsx` e `src/Pet.css`
   - a pasta `public/pet/` com `body.webp`, `antenna-l.webp` e `antenna-r.webp`
     (`alien-cat.webp` e `original.webp` são só a imagem recortada/original, não são usadas pelo componente)
3. Renderize uma vez, em qualquer lugar da árvore (ele é `position: fixed`):

```jsx
import Pet from "./Pet";

<Pet size={200} wander follow={false} />
```

| Prop     | Padrão | O que faz                                   |
| -------- | ------ | ------------------------------------------- |
| `size`   | `200`  | Largura/altura em px                        |
| `wander` | `true` | Passeia sozinho de tempos em tempos         |
| `follow` | `false`| Segue o cursor mantendo distância           |
| `margin` | `24`   | Distância inicial do canto inferior direito |

> Se o projeto não usa Vite, troque `import.meta.env.BASE_URL` em `Pet.jsx` pelo prefixo onde os `.webp` ficam
> (ex.: `"/"` no Create React App / Next, que servem a pasta `public/` na raiz).

## Como a imagem foi preparada

A foto foi recortada (fundo removido) e dividida em 3 camadas do mesmo tamanho: corpo e as duas antenas.
Assim as antenas giram sozinhas, com mola, a partir da base. A parte de baixo tem um fade porque a foto
original é cortada ali — por isso ele "espia" pela borda inferior da tela.

O comportamento respeita `prefers-reduced-motion` (sem passeio, sem seguir, sem balanço).

## Gatinhos dançantes (`DancingCats`)

Segundo pet, feito a partir de um vídeo com fundo verde (chroma key) convertido em WebP animado com transparência.
Eles ficam parados e dançam ao clicar (ou enquanto você arrasta).

```jsx
import DancingCats from "./DancingCats";

<DancingCats size={240} danceMs={7000} />
```

Arquivos: `src/DancingCats.jsx` e `public/pet/cats-still.webp` + `public/pet/cats-dance.webp`.
