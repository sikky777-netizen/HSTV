(() => {
  const $ = (id) => document.getElementById(id);
  const sizes = [55, 65, 75, 77, 83, 85, 98, 100];
  const widths = {55:123,65:145,75:167,77:172,83:185,85:190,98:219,100:224};
  const budgetNames = {none:'예산 제한 없음',100:'100만원 이하',200:'100~200만원',300:'200~300만원',500:'300~500만원',999:'500만원 이상'};
  const clamp = (n,min,max) => Math.min(max,Math.max(min,n));

  function baseIndex(distance){
    if(distance < 1.6) return 0;
    if(distance < 2.05) return 1;
    if(distance < 2.45) return 2;
    if(distance < 2.9) return 3;
    if(distance < 3.3) return 5;
    if(distance < 3.8) return 6;
    return 7;
  }

  function budgetCeiling(budget, priority, panel){
    if(budget === 'none') return 7;
    let cap = {100:1,200:2,300:5,500:6,999:7}[budget] ?? 7;
    if(priority === 'size') cap = Math.min(7, cap + 1);
    if(priority === 'quality') cap = Math.max(0, cap - 1);
    if(panel === 'OLED' && budget !== '999') cap = Math.max(0, cap - 1);
    return cap;
  }

  function choosePanel({brightness, content, gaming, viewing, priority, budget}){
    let panel = 'QLED / 고급 LED';
    let reason = '가격과 밝기, 화면 크기의 균형';
    if(priority === 'quality' && brightness !== 'bright') { panel = 'OLED'; reason = '블랙 표현과 영화 화질 우선'; }
    else if(brightness === 'bright') { panel = 'Mini LED / QLED'; reason = '밝은 거실의 높은 화면 밝기 우선'; }
    else if(content === 'movie' && budget !== '100') { panel = 'OLED 또는 Mini LED'; reason = '영화 몰입감과 명암 표현 우선'; }
    else if(gaming === 'often' && budget !== '100') { panel = 'OLED 또는 Mini LED'; reason = '게임 응답성과 120Hz 대응 우선'; }
    else if(viewing === 'wide' && priority !== 'size' && budget !== '100') { panel = 'OLED 우선 검토'; reason = '여러 각도에서 보는 시야각 고려'; }
    if(priority === 'size' && budget !== 'none' && budget !== '999') { panel = 'QLED / LED'; reason = '화질보다 큰 화면을 우선해 예산 효율 확보'; }
    return {panel, reason};
  }

  function calculate(){
    const validation = $('validation');
    const distance = Number($('distance').value);
    const wallWidth = Number($('wallWidth').value);
    const eyeHeight = Number($('eyeHeight').value);
    if(!Number.isFinite(distance) || distance < 0.8 || distance > 8){ validation.textContent='시청거리는 0.8m~8m 사이로 입력해주세요.'; return false; }
    if(!Number.isFinite(wallWidth) || wallWidth < 100 || wallWidth > 1000){ validation.textContent='설치 공간 가로폭은 100~1000cm 사이로 입력해주세요.'; return false; }
    if(!Number.isFinite(eyeHeight) || eyeHeight < 70 || eyeHeight > 180){ validation.textContent='눈높이는 70~180cm 사이로 입력해주세요.'; return false; }
    validation.textContent='';

    const vision = Number($('vision').value);
    const content = document.querySelector('input[name="content"]:checked').value;
    const subtitles = $('subtitles').checked;
    const gaming = $('gaming').value;
    const budget = $('budget').value;
    const priority = $('priority').value;
    const brightness = $('brightness').value;
    const viewing = $('viewing').value;
    const installType = $('installType').value;

    const baseIdx = baseIndex(distance);
    let adjust = 0;
    if(vision === 1) adjust += .3;
    if(vision === 2) adjust += .7;
    if(vision === 3) adjust += 1.0;
    if(content === 'movie') adjust += .55;
    if(content === 'sports') adjust += .35;
    if(content === 'youtube') adjust += .2;
    if(subtitles) adjust += .3;
    if(priority === 'size') adjust += .45;
    if(priority === 'quality') adjust -= .15;

    const idealIdx = clamp(Math.round(baseIdx + adjust),0,sizes.length-1);
    const ideal = sizes[idealIdx];
    const low = sizes[Math.max(0, idealIdx-1)];
    const high = sizes[Math.min(sizes.length-1, idealIdx+1)];

    const panelInfo = choosePanel({brightness,content,gaming,viewing,priority,budget});
    const budgetCap = budgetCeiling(budget, priority, panelInfo.panel.startsWith('OLED') ? 'OLED' : 'OTHER');
    let realIdx = Math.min(idealIdx, budgetCap);
    if(realIdx < 0) realIdx = 0;
    const real = sizes[realIdx];

    const featureList = ['4K'];
    if(gaming === 'often' || content === 'sports') featureList.push('120Hz');
    if(gaming === 'often') featureList.push('HDMI 2.1 / VRR');
    if(brightness === 'bright') featureList.push('고휘도');
    if(viewing === 'wide') featureList.push('광시야각');
    if(content === 'movie') featureList.push('HDR');

    const viewMin = (real * 2.54 * 1.2 / 100).toFixed(1);
    const viewMax = (real * 2.54 * 1.5 / 100).toFixed(1);
    const spare = wallWidth - (widths[real] || 190);
    let fit = '설치 여유 있음', fitDetail = `좌우 공간 약 ${Math.max(0,Math.round(spare))}cm`;
    if(spare < 0){ fit='공간 폭 부족 가능'; fitDetail=`TV 폭이 약 ${Math.abs(Math.round(spare))}cm 더 큼`; }
    else if(spare < 10){ fit='매우 빠듯함'; fitDetail=`좌우 총 여유 약 ${Math.round(spare)}cm`; }
    else if(spare < 30){ fit='설치 가능 · 확인 필요'; fitDetail=`좌우 총 여유 약 ${Math.round(spare)}cm`; }

    const mountLow = Math.round(eyeHeight);
    const mountHigh = Math.round(eyeHeight + 10);
    const visionText = ['보정 없음','시력을 소폭 보정','가독성을 위해 큰 화면 쪽 보정','가독성을 우선해 큰 화면 쪽 보정'][vision];
    const contentText = {general:'일반 방송',movie:'영화·OTT',sports:'스포츠',youtube:'유튜브'}[content];
    const priorityText = {balanced:'크기·화질 균형',size:'큰 화면 우선',quality:'화질 우선'}[priority];

    $('realSize').innerHTML = `${real}<small>인치</small>`;
    $('idealSize').innerHTML = `${ideal}<small>인치</small>`;
    $('idealRange').textContent = `적정 범위 ${low}~${high}인치`;
    $('heroSize').textContent = real;
    $('panelType').textContent = panelInfo.panel;
    $('panelReason').textContent = panelInfo.reason;
    $('features').textContent = featureList.join(' · ');
    $('viewDistance').textContent = `${viewMin} ~ ${viewMax}m`;
    $('wallFit').textContent = fit;
    $('wallFitDetail').textContent = fitDetail;
    $('mountHeight').textContent = installType === 'wall' ? `화면 중심 약 ${mountLow}~${mountHigh}cm` : `스탠드 상판 포함 눈높이 근처 권장`;
    $('mountNote').textContent = installType === 'wall' ? '앉았을 때 눈높이 기준. 벽체와 콘센트 위치를 함께 확인하세요.' : '화면 중심이 앉은 눈높이와 크게 벗어나지 않도록 TV장 높이를 확인하세요.';

    if(real < ideal){
      $('realReason').textContent = `${budgetNames[budget]} · ${priorityText} 기준`;
    } else {
      $('realReason').textContent = `예산과 사용환경에서도 추천 크기 유지`;
    }

    const reasons = [];
    reasons.push(`${distance.toFixed(1)}m 시청거리의 기본 기준은 ${sizes[baseIdx]}인치입니다.`);
    reasons.push(`${visionText}했고, ${contentText}${subtitles?' + 자막 사용':''} 성향을 반영해 조건상 ${ideal}인치가 가장 잘 맞습니다.`);
    if(real < ideal) reasons.push(`다만 ${budgetNames[budget]}과 '${priorityText}' 조건을 적용하면 현실 구매 추천은 ${real}인치입니다.`);
    else reasons.push(`선택한 예산과 '${priorityText}' 조건에서도 ${real}인치를 유지할 수 있는 구성입니다.`);
    reasons.push(`${brightness==='bright'?'밝은':'보통 또는 어두운'} 공간, ${viewing==='wide'?'여러 시청 각도':'주로 정면 시청'} 조건을 고려해 ${panelInfo.panel} 계열을 우선 제안합니다.`);
    $('explanation').textContent = reasons.join(' ');

    return true;
  }

  function switchView(showResult){
    const inputView = $('inputView');
    const resultView = $('resultView');
    const next = showResult ? resultView : inputView;
    const previous = showResult ? inputView : resultView;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const reveal = () => {
      previous.classList.remove('is-active');
      previous.hidden = true;
      next.hidden = false;
      next.classList.remove('is-active');
      void next.offsetWidth;
      next.classList.add('is-active');
      window.scrollTo({top:0, behavior:reduceMotion ? 'auto' : 'smooth'});
      (showResult ? $('backToInput') : $('distance')).focus({preventScroll:true});
    };

    if(reduceMotion){ reveal(); return; }
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    flash.setAttribute('aria-hidden','true');
    document.body.appendChild(flash);
    window.setTimeout(reveal, 180);
    flash.addEventListener('animationend', () => flash.remove(), {once:true});
  }

  $('tvForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if(calculate()) switchView(true);
  });
  $('backToInput').addEventListener('click', () => switchView(false));

  let deferredPrompt = null;
  const installBtn = $('installBtn');
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; installBtn.hidden = false; });
  installBtn.addEventListener('click', async () => { if(!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; installBtn.hidden = true; });
  window.addEventListener('appinstalled', () => { installBtn.hidden = true; });

  if('serviceWorker' in navigator){ window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(()=>{})); }
})();
