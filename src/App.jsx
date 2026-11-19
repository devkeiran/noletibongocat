import { useState } from "react";
import Pet from "./Pet.jsx";
import "./App.css";

const SNIPPET = `import Pet from "./Pet";

export default function App() {
  return (
    <>
      <MinhaPagina />
      <Pet size={200} wander follow={false} />
    </>
  );
}`;

export default function App() {
  const [wander, setWander] = useState(true);
  const [follow, setFollow] = useState(false);
  const [size, setSize] = useState(200);

  return (
    <div className="page">
      <header className="nav">
        <strong>🛸 Noleti</strong>
        <nav>
          <a href="#como">Como funciona</a>
          <a href="#codigo">Código</a>
          <a href="#contato">Contato</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">Exemplo de pet interativo · React</p>
          <h1>
            Um alienígena peludo <span>vive nesta página</span>
          </h1>
          <p className="lead">
            Ele olha pro seu mouse, balança as antenas, passeia sozinho, dorme se você ficar parado e pode ser
            arrastado pra qualquer lugar. Tente mexer nele!
          </p>

          <div className="panel">
            <label>
              <input type="checkbox" checked={wander} onChange={(e) => setWander(e.target.checked)} />
              Passear sozinho
            </label>
            <label>
              <input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} />
              Seguir o mouse
            </label>
            <label className="range">
              Tamanho: {size}px
              <input type="range" min="100" max="320" step="10" value={size} onChange={(e) => setSize(+e.target.value)} />
            </label>
          </div>
        </section>

        <section id="como" className="cards">
          <article>
            <h2>👀 Olha pro mouse</h2>
            <p>A cabeça gira em 3D na direção do cursor, com suavização de mola.</p>
          </article>
          <article>
            <h2>🖐️ Arrastável</h2>
            <p>Pegue e solte. As antenas balançam com a inércia e ele &ldquo;amassa&rdquo; ao ser solto.</p>
          </article>
          <article>
            <h2>💤 Dorme</h2>
            <p>Fique 25 segundos sem mexer em nada e ele cochila. Mexa o mouse e ele acorda.</p>
          </article>
          <article>
            <h2>🖱️ Clique</h2>
            <p>Ele pula e solta uma frase aleatória em um balão de fala.</p>
          </article>
        </section>

        <section id="codigo" className="code">
          <h2>Usando na sua página</h2>
          <pre>{SNIPPET}</pre>
          <p>
            Veja o <code>README.md</code> para saber quais arquivos copiar.
          </p>
        </section>

        <section id="contato" className="code">
          <h2>Texto qualquer pra rolar a página</h2>
          <p>
            O pet usa <code>position: fixed</code> e só a silhueta dele recebe cliques — o resto do quadrado deixa
            o clique passar para a página (links, botões, tudo funciona normalmente por baixo).
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
          <button className="btn" onClick={() => alert("O clique passou por baixo do pet 🎉")}>
            Botão de teste
          </button>
        </section>
      </main>

      <Pet size={size} wander={wander} follow={follow} />
    </div>
  );
}
