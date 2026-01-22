import React, { useState, useCallback, useRef } from 'react';
import { Page, Toolbar, Card, Button, List, ListItem, Icon, Tabbar, Tab, Dialog, ProgressCircular, ListHeader, ToolbarButton } from 'react-onsenui';
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';


// 動画リスト
const videoList = [
  { id: 0, name: '支柱', ytid: 'PR_Gd8jxFwM' },
  { id: 1, name: '手すり', ytid: 'PR_Gd8jxFwM' },
  { id: 2, name: '先行手すり', ytid: 'PR_Gd8jxFwM' },
  { id: 3, name: 'Sウォーク', ytid: 'PR_Gd8jxFwM' },
];

const manualPages = [
  new URL('./assets/manual/p1.jpg', import.meta.url).href,
  new URL('./assets/manual/p2.jpg', import.meta.url).href,
  new URL('./assets/manual/p3.jpg', import.meta.url).href,
  new URL('./assets/manual/p4.jpg', import.meta.url).href,
  new URL('./assets/manual/p5.jpg', import.meta.url).href,
  new URL('./assets/manual/p6.jpg', import.meta.url).href,
  new URL('./assets/manual/p7.jpg', import.meta.url).href,
  new URL('./assets/manual/p8.jpg', import.meta.url).href,
  new URL('./assets/manual/p9.jpg', import.meta.url).href,
];

const styles = `
  .material-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; padding: 10px; }
  .item-card { margin: 0 !important; cursor: pointer; text-align: center; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  .ons-dialog { border-radius: 12px !important; overflow: hidden; }
  .menu-btn { margin-bottom: 12px !important; height: 50px; font-size: 16px; }
  .full-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #000; z-index: 10001; display: flex; flex-direction: column; }
  
  /* 動画表示エリア：画面の余った領域をすべて使う */
  .media-box { 
    flex: 1; 
    width: 100%; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    position: relative; 
    overflow: hidden; 
    background: #000; 
  }

  /* YouTube専用コンテナ：16:9を維持しつつ画面内に収める */
  .video-container {
    width: 100%;
    /* 画面の高さ(100vh)から上下のバー(ヘッダー+フッター約150px)を引いた範囲に収める */
    max-height: calc(100vh - 160px); 
    aspect-ratio: 16 / 9; 
    position: relative;
    background: #000;
    /* 横長画面で動画が小さくなりすぎないよう調整 */
    display: flex;
    align-items: center;
  }

/* 浮遊感のある「戻る」ボタン */
  .floating-back-btn {
    position: absolute;
    bottom: 8px; /* 下から少し浮かす */
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 152, 0, 0.9); /* 視認性の良いオレンジ */
    color: white;
    border: none;
    padding: 12px 35px;
    border-radius: 50px; /* 丸いデザイン */
    font-size: 18px;
    font-weight: bold;
    z-index: 1002;
    box-shadow: 0 4px 15px rgba(0,0,0,0.6); /* 影をつけて浮かす */
    display: flex;
    align-items: center;
    gap: 10px;
    white-space: nowrap;
  }
  
  .physical-back-btn { width: 100%; max-width: 500px; height: 60px; background: #ff9800; color: white; font-size: 18px; font-weight: bold; border: none; border-radius: 10px; box-shadow: 0 4px 0 #e68a00; }
  .calc-btn { height: 55px; font-size: 20px; background-color: #666; color: white; border-radius: 4px; }
  


/* ログイン画面用のスタイル */
.login-container {
  /* スクロールを禁止し、画面ぴったりに固定 */
  width: 100vw;
  height: 100vh;
  overflow: hidden; 
  
  padding: 0; /* 中央寄せを正確にするためpaddingを調整 */
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* 画面中央に配置 */
  background: linear-gradient(180deg, #f0f4f7 0%, #ffffff 100%);
}

.login-logo-circle {
    width: 180px; /* 横長のロゴに合わせて幅を広げる */
    height: 80px;  /* 高さを抑える */
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30px;
  }

.login-card {
  background: white;
  padding: 30px 20px;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  width: 90%; /* スマホからはみ出さないよう調整 */
  max-width: 320px;
  box-sizing: border-box; /* paddingを含めた幅計算 */
}

.login-input {
  width: 100%;
  box-sizing: border-box; /* paddingを含めた幅計算 */
  padding: 15px;
  font-size: 18px;
  margin: 20px 0;
  text-align: center;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  transition: border-color 0.3s;
}

.login-input:focus {
  border-color: #ff9800;
  outline: none;
}

.login-btn {
  width: 100%;
  height: 55px;
  font-size: 18px;
  border-radius: 12px !important;
  background-color: #00629d !important;
}

  
`;

const MATERIALS = [
  { id: 0, name: '支柱', img: new URL('./assets/item/shichu.png', import.meta.url).href },
  { id: 1, name: '手すり', img: new URL('./assets/item/tesuri.png', import.meta.url).href },
  { id: 2, name: '先行手すり', img: new URL('./assets/item/senko.png', import.meta.url).href },
  { id: 3, name: 'Sウォーク', img: new URL('./assets/item/swalk.png', import.meta.url).href },
];

const GAS_URL = "https://script.google.com/macros/s/AKfycbzKVWHXiTdqR30nQQy3V17A6KtzLYjFZj75G_jtliZqvSiOCkh5bk_h2A9rCPX-1ZWsvg/exec";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inputPass, setInputPass] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [cart, setCart] = useState([]); 
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const [showChoiceDialog, setShowChoiceDialog] = useState(false);
  const [showCalcDialog, setShowCalcDialog] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showBook, setShowBook] = useState(false);
  const [isLoopMode, setIsLoopMode] = useState(false); 

  const [selectedItem, setSelectedItem] = useState(null);
  const [currentVideoIdx, setCurrentVideoIdx] = useState(0);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [calcDisplay, setCalcDisplay] = useState(''); 
  const [editingIndex, setEditingIndex] = useState(null);

  // --- ズーム用ステート (必ずAppの中に置く) ---
  const [scale, setScale] = useState(1);
  const imgRef = useRef(null);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(1, scale + delta), 4);
    setScale(newScale);
  };

  const changePage = (nextIdx) => {
    setCurrentPageIdx(nextIdx);
    setScale(1); // リセット
  };

  const handleLogin = async () => {
    if (!inputPass) return;
    setLoading(true);
    try {
      const response = await fetch(GAS_URL, { method: "POST", body: JSON.stringify({ auth: inputPass, mode: "login" }) });
      const data = await response.json();
      if (data.result === "success") {
        setAuthToken(inputPass);
        setIsLoggedIn(true);
        fetchHistory(inputPass);
      } else { alert("パスワードが違います"); }
    } catch (e) { alert("通信エラー"); } finally { setLoading(false); }
  };

  const fetchHistory = async (token) => {
    try {
      const response = await fetch(GAS_URL, { method: "POST", body: JSON.stringify({ auth: token, mode: "history" }) });
      const data = await response.json();
      if (Array.isArray(data)) {
        const summary = data.reduce((acc, obj) => {
          const dateKey = obj.date.split(' ')[0];
          if (!acc[dateKey]) acc[dateKey] = {};
          const itemKey = `${obj.name}-${obj.type}`;
          if (!acc[dateKey][itemKey]) acc[dateKey][itemKey] = { ...obj };
          else acc[dateKey][itemKey].count += Number(obj.count);
          return acc;
        }, {});
        setHistory(summary);
      }
    } catch (e) { console.error(e); }
  };

  const sendOrder = async () => {
    setIsSending(true);
    try {
      await fetch(GAS_URL, { method: "POST", mode: "no-cors", body: JSON.stringify({ auth: authToken, items: cart.map(i => ({name: i.name, count: i.count, type: i.type})) }) });
      alert("送信完了しました");
      setCart([]);
      setTimeout(() => fetchHistory(authToken), 3000);
    } catch (e) { alert("送信エラー"); } finally { setIsSending(false); }
  };

  const addToCart = (type) => {
    const count = parseInt(calcDisplay) || 0;
    if (count <= 0) return alert("数量を正しく入力してください");
    if (editingIndex !== null) {
      const newCart = [...cart];
      newCart[editingIndex] = { ...selectedItem, count, type };
      setCart(newCart);
    } else {
      setCart([...cart, { ...selectedItem, count, type }]);
    }
    closeAll();
  };

  const closeAll = () => {
    setShowChoiceDialog(false); setShowCalcDialog(false); 
    setShowVideo(false); setShowBook(false);
    setIsLoopMode(false); setSelectedItem(null); 
    setCalcDisplay(''); setEditingIndex(null);
    setScale(1); // ズームリセット
  };

  const getTypeColor = (type) => {
    const colors = { '通常': '#555', 'ケレン': '#FF9800', '修理': '#f44336', '完全': '#4CAF50' };
    return colors[type] || '#000';
  };



 if (!isLoggedIn) {
  return (
    <Page>
      <style>{styles}</style>
      <div className="login-container">
        {/* 上部のアイコン部分：Iconからimgタグに変更 */}
        <div className="login-logo-circle">
        <img 
            src="https://www.takamiya.co/common/img/main_logo.svg" 
            alt="TAKAMIYA Logo" 
            style={{ 
            width: '100%',    /* 枠に対して少し余裕を持たせる */
            height: '100%', 
            objectFit: 'contain' /* アスペクト比を維持して枠内に収める */
            }} 
        />
        </div>

        <div className="login-card">
          <h2 style={{ margin: '0 0 5px 0', color: '#333' }}>機材管理システム</h2>
          <p style={{ margin: '0 0 20px 0', color: '#888', fontSize: '14px' }}>Signage & Inventory</p>
          
          {/* 現場イメージ画像 */}
          <div style={{ width: '100%', height: '120px', backgroundColor: '#eee', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Icon icon="md-store" style={{ fontSize: '40px', color: '#bbb' }} />
          </div>

          <input 
            type="password" 
            value={inputPass} 
            onChange={e => setInputPass(e.target.value)} 
            className="login-input"
            placeholder="パスワードを入力"
          />
          
          <Button className="login-btn" onClick={handleLogin}>
            {loading ? <ProgressCircular indeterminate style={{ verticalAlign: 'middle' }} /> : "ログインして開始"}
          </Button>
        </div>
        
        <p style={{ marginTop: '30px', color: '#bbb', fontSize: '12px' }}>© 2026 Inventory Management System</p>
      </div>
    </Page>
  );
}

  return (
    <Page renderToolbar={() => (
      <Toolbar>
        <div className="center">資材管理・整備</div>
        <div className="right">
          <ToolbarButton onClick={() => { setCurrentVideoIdx(0); setIsLoopMode(true); setShowVideo(true); }}>
            <Icon icon="md-refresh-sync" style={{color: '#ff9800'}} />
          </ToolbarButton>
        </div>
      </Toolbar>
    )}>
      <style>{styles}</style>
      
      <Tabbar position='bottom' renderTabs={() => [
        { content: (
          <Page>
            <div className="material-grid">
              {MATERIALS.map((item) => (
                <Card key={item.id} className="item-card" onClick={() => { setSelectedItem(item); setShowChoiceDialog(true); }}>
                  <img src={item.img} alt={item.name} style={{ width: '100%', aspectRatio: '3/2', objectFit: 'cover' }} />
                  <div style={{ fontWeight: 'bold', padding: '10px' }}>{item.name}</div>
                </Card>
              ))}
            </div>
          </Page>
        ), tab: <Tab label="資材" icon="md-apps" key="t1" /> },
        { content: (
          <Page>
            <ListHeader>送信待ちリスト</ListHeader>
            <List>
              {cart.map((c, i) => (
                <ListItem key={`cart-${i}`} onClick={() => { setSelectedItem(c); setEditingIndex(i); setCalcDisplay(c.count.toString()); setShowCalcDialog(true); }} tappable>
                  <div className="center"><b>{c.name}</b> <small style={{backgroundColor: getTypeColor(c.type), color: '#fff', padding: '2px 8px', borderRadius: '10px', marginLeft: '5px', fontSize: '10px'}}>{c.type}</small></div>
                  <div className="right" style={{color: '#0044cc', fontWeight: 'bold'}}>{c.count}</div>
                </ListItem>
              ))}
            </List>
            <div style={{padding: '20px'}}><Button modifier="large" onClick={sendOrder} disabled={cart.length === 0}>{isSending ? <ProgressCircular indeterminate /> : `サーバーへ送信 (${cart.length})`}</Button></div>
          </Page>
        ), tab: <Tab label="送信" icon="md-upload" badge={cart.length > 0 ? cart.length : null} key="t2" /> },
        { content: (
          <Page>
            <ListHeader>整備履歴</ListHeader>
            {Object.keys(history).length === 0 ? <div style={{padding: '20px', textAlign: 'center', color: '#888'}}>履歴がありません</div> :
              Object.keys(history).sort().reverse().map((date, idx) => (
                <div key={`hist-group-${idx}`}>
                  <ListHeader style={{backgroundColor: '#00629d', color: '#fff'}}>{date}</ListHeader>
                  <List>{Object.values(history[date]).map((h, i) => (
                    <ListItem key={`hist-item-${idx}-${i}`}><div className="center">{h.name} <small style={{marginLeft: '5px'}}>({h.type})</small></div><div className="right">{h.count}</div></ListItem>
                  ))}</List>
                </div>
              ))
            }
          </Page>
        ), tab: <Tab label="履歴" icon="md-time" key="t3" /> }
      ]} />

      <Dialog isOpen={showChoiceDialog} onCancel={closeAll} cancelable>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{marginTop: 0}}>{selectedItem?.name}</h3>
          <Button modifier="large" className="menu-btn" onClick={() => { setShowChoiceDialog(false); setCurrentVideoIdx(selectedItem.id); setIsLoopMode(false); setShowVideo(true); }}>
            <Icon icon="md-videocam" /> 手順動画
          </Button>
          <Button modifier="large" className="menu-btn" onClick={() => { setShowChoiceDialog(false); setCurrentPageIdx(0); setScale(1); setShowBook(true); }}>
            <Icon icon="md-book" /> マニュアル(1-9P)
          </Button>
          <Button modifier="large" className="menu-btn" style={{backgroundColor: '#00629d'}} onClick={() => { setShowChoiceDialog(false); setShowCalcDialog(true); }}>
            <Icon icon="md-edit" /> 整備完了入力
          </Button>
          <Button modifier="quiet" onClick={closeAll}>キャンセル</Button>
        </div>
      </Dialog>

      <Dialog isOpen={showCalcDialog} onCancel={closeAll} cancelable>
        <div style={{ padding: '15px', textAlign: 'center' }}>
          <h3>{selectedItem?.name}</h3>
          <div style={{ background: '#eee', padding: '10px', fontSize: '28px', textAlign: 'right', borderRadius: '5px', fontWeight: 'bold' }}>{calcDisplay || '0'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginTop: '10px' }}>
            {['7','8','9','+','4','5','6','-','1','2','3','*','C','0','=','/'].map(b => (
              <Button key={b} className="calc-btn" onClick={() => {
                if (b === 'C') setCalcDisplay('');
                else if (b === '=') { try { setCalcDisplay(eval(calcDisplay).toString()); } catch { setCalcDisplay('Error'); } }
                else setCalcDisplay(prev => prev + b);
              }}>{b}</Button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '15px' }}>
            {['通常', 'ケレン', '修理', '完全'].map(t => <Button key={t} onClick={() => addToCart(t)} style={{backgroundColor: getTypeColor(t)}}>{t}保存</Button>)}
          </div>
        </div>
      </Dialog>

  {showVideo && (
  <div className="full-overlay">
    <div className="media-box">
      <div className="video-container">
        <iframe
          key={videoList[currentVideoIdx].id + '-' + currentVideoIdx}
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoList[currentVideoIdx].ytid}?autoplay=1&mute=1&rel=0&playsinline=1&loop=1&playlist=${videoList[currentVideoIdx].ytid}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            backgroundColor: '#000' 
          }}
        ></iframe>
      </div>

      {/* 動画の上に浮かぶボタン（コンテナより後に書くことで前面に配置） */}
      <button className="floating-back-btn" onClick={closeAll}>
        <Icon icon="md-chevron-left" style={{ fontSize: '24px' }} />
        メニューに戻る
      </button>
    </div>
  </div>
)}
{showBook && (
  <div className="full-overlay">
    {/* ズーム操作用ボタン一式 */}
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 10015, display: 'flex', gap: '10px' }}>
      <Button onClick={() => setScale(s => Math.min(s + 0.5, 4))} style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>+</Button>
      <Button onClick={() => setScale(1)} style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>リセット</Button>
      <Button onClick={() => setScale(s => Math.max(s - 0.5, 1))} style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>−</Button>
    </div>

    {/* マニュアル画像表示エリア */}
    <div 
      onWheel={handleWheel} 
      style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        overflow: 'hidden',
        touchAction: 'pinch-zoom',
        position: 'relative' /* ボタン配置の基準にする */
      }}
    >
      {/* 左ページ送り */}
      <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: '15%', zIndex: 10006, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
           onClick={() => currentPageIdx > 0 && changePage(currentPageIdx - 1)}>
        {currentPageIdx > 0 && <Icon icon="md-chevron-left" style={{ fontSize: '40px', color: '#fff', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '50%' }} />}
      </div>

      <img 
        ref={imgRef}
        src={manualPages[currentPageIdx]} 
        key={currentPageIdx} 
        style={{ 
          maxHeight: '100%', /* フッターがなくなった分、より大きく表示 */
          maxWidth: '100%', 
          objectFit: 'contain',
          transform: `scale(${scale})`,
          transition: 'transform 0.1s ease-out',
          userSelect: 'none'
        }} 
      />

      {/* 右ページ送り */}
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '15%', zIndex: 10006, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
           onClick={() => currentPageIdx < manualPages.length - 1 && changePage(currentPageIdx + 1)}>
        {currentPageIdx < manualPages.length - 1 && <Icon icon="md-chevron-right" style={{ fontSize: '40px', color: '#fff', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '50%' }} />}
      </div>

      {/* ページ番号表示（位置をボタンと被らないよう少し上げる） */}
      <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', color: '#fff', backgroundColor: 'rgba(0,0,0,0.6)', padding: '5px 15px', borderRadius: '20px', fontSize: '14px', zIndex: 10007 }}>
        {currentPageIdx + 1} / {manualPages.length} ページ
      </div>

      {/* 修正：動画画面と同じ「戻る」ボタン */}
      <button className="floating-back-btn" onClick={closeAll}>
        <Icon icon="md-chevron-left" style={{ fontSize: '24px' }} />
        メニューに戻る
      </button>
    </div>
  </div>
)}
    </Page>
  );
}

export default App;