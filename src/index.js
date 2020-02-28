/*Import */
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

  /* Fonction composant on utilise une fonction
   lorque le composant contient uniquement render et n'a aucun influance sur son état */
function Square(props) {
  // Concatène les classes pour pouvoir ajouter la mise en avant des cases gagnantes
  const className = 'square' + (props.highlight ? (' highlight') : '');
    return (
      
      /* data-player permet de changer la couleur de chaque joueur à partir de la value du joueur soit X ou O*/
        <button className={className} 
            data-player={props.value} 
            onClick={props.onClick}>
            {props.value}
        </button>
    );
}

  /* Classe Board étendu du composant React */
  class Board extends React.Component {

      /* Rendu du composant Square dans le composant Board, Square Enfant de Board*/
    renderSquare(i) {
      // récupération des cases
      const winLine = this.props.winLine;
      return <Square key={i}
                    value={this.props.squares[i]}
                    onClick={() => this.props.onClick(i)} 
                    highlight={winLine && winLine.includes(i)}
                    />

    }
   /* Rendu du composant Board */
    render() {
      //Deux boucles pour afficher la grille de morpion boardSize nombre de case et row nombre de ligne 
      /*methode push colle les valeurs dans le tableau*/
        const boardSize = 3;
        let squares = [];
        for(let i = 0; i < boardSize; ++i){
          let row = [];
          for(let j = 0; j < boardSize; ++j) {
            row.push(this.renderSquare(i * boardSize +j)); 
          
          }
        squares.push(<div key={i} className="board-row">{row}</div>)
        }
      return (
        <div>
          {squares}
        </div>
      );
    }
  }

/* Classe Game étendu du composant React */
  class Game extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          history: [{
            squares: Array(9).fill(null),
          }],
          stepNumber: 0,
          xIsNext: true,
      };
    }
    handleClick(i){
        /* Slice permet de créer une copie du tableau */
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        // Ajout de l'objet winner dans le test car calculateWinner peut renvoyer un ou plusieur objets
        if(calculateWinner(squares).winner || squares[i]) {
            return;
        }
        squares[i]=this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
              squares : squares,
              //le dernier tour enregister
              latestMoveSquare: i,
            }]),
            stepNumber: history.length,
            xIsNext : !this.state.xIsNext,
        });
    }
    jumpTo(step) {
      this.setState({
        stepNumber: step,
        xIsNext: (step % 2) === 0,
      });
    }
    // Méthode pour inverser l'ordre chronologique des tours 
    handleSortToggle() {
      this.setState({
        isAscending: !this.state.isAscending
      });
    }
    render() {
      const history = this.state.history;
      const stepNumber = this.state.stepNumber;
      const current = history[stepNumber];
      // récupère l'objet de calculateWinner()
      const winInfo = calculateWinner(current.squares);
      const winner = winInfo.winner;

      const moves = history.map((step, move) => {
        /*Récupère le dernier tour*/
        const latestMoveSquare = step.latestMoveSquare;
        /*Récupère la colonne et la ligne */
        const col = 1 + latestMoveSquare % 3;
        const row = 1 + Math.floor(latestMoveSquare / 3);
        /*Affiche la colonne, la ligne et le nombre de tour  */
        const desc = move ? 
        `Revenir au tour n° ${move}(${col}, ${row})`: 
        'Revenir au début de la partie';
          return (
            <li key={move}>
              <button className={move === stepNumber ? 'move-list-item-selected' : ''} onClick={() => this.jumpTo(move)}>{desc}</button>
            </li>
          );
      });
      let status;
      if (winner) {
      status = <span className="game-text game-win">Le joueur {winner} a gagné</span>;

      } else if (current.squares.every(Boolean)) { // permet de tester si toute les cases sont remplis
        status = <span className="game-text game-lose">Match nul !</span>;
      } else {
        status = <span className="game-text game-start"> Joueur suivant :  {(this.state.xIsNext ? 'X' : 'O')} </span>;
      }
      /*Inverse l'ordre chronologique*/
      const isAscending = this.state.isAscending;
      if (!isAscending) {
        moves.reverse();
      }
      return (
        
        <div className="game">
          <h1 className="game-title">Jeu de Memory</h1>
          <div className="game-block">
            <div className="game-board">
              <Board 
                squares={current.squares}
                onClick={(i) => this.handleClick(i)}
                winLine={winInfo.line}
              />
            </div>
            <div className="game-info">
              <div>{status}</div>
              <button onClick={() => this.handleSortToggle()}>
                {isAscending ? 'descending' : 'ascending'}
              </button>
              <ol>{moves}</ol>
            </div>
          </div>
        </div>
      );
    }
  }
  
  // ========================================
  
  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );
  function calculateWinner(squares) {
      const lines = [
          [0,1,2],
          [3,4,5],
          [6,7,8],
          [0,3,6],
          [1,4,7],
          [2,5,8],
          [0,4,8],
          [2,4,6],
      ];
      for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if(squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {winner: squares[a], line: lines[i]};
        }
        
      }
      return {winner : null,
      line : null};
  }