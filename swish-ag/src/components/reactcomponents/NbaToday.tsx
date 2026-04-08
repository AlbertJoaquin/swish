'use client';

import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faBoltLightning } from '@fortawesome/free-solid-svg-icons';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

type Team = {
  abbreviation: string;
  displayName: string;
  logo: string;
  score: string;
};

type Game = {
  id: string;
  name: string;
  status: string;
  detail: string;
  date: string;
  home: Team;
  away: Team;
};

type PlayerStat = {
  name: string;
  team: string;
  min: string;
  pts: string;
  ast: string;
  reb: string;
  stl: string;
  blk: string;
  fg: string;
  threept: string;
  ft: string;
};

function getDateStrForTab(tab: number) {
  const now = new Date();
  const phtDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  const etOffset = tab - 1;
  phtDate.setDate(phtDate.getDate() + etOffset);
  const y = phtDate.getFullYear();
  const m = String(phtDate.getMonth() + 1).padStart(2, '0');
  const d = String(phtDate.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function parseGames(data: any): Game[] {
  return (data.events || []).map((event: any) => {
    const comp = event.competitions?.[0];
    const home = comp.competitors.find((c: any) => c.homeAway === 'home');
    const away = comp.competitors.find((c: any) => c.homeAway === 'away');
    return {
      id: event.id,
      name: event.name,
      status: event.status?.type?.name || '',
      detail: event.status?.type?.shortDetail || '',
      date: event.date || '',
      home: {
        abbreviation: home.team.abbreviation,
        displayName: home.team.displayName,
        logo: home.team.logo,
        score: home.score || '0',
      },
      away: {
        abbreviation: away.team.abbreviation,
        displayName: away.team.displayName,
        logo: away.team.logo,
        score: away.score || '0',
      },
    };
  });
}

function getStatusInfo(game: Game) {
  const s = game.status;
  const detail = game.detail;
  if (s === 'STATUS_FINAL') return { label: 'Final', cls: 'nba-final' };
  if (s === 'STATUS_IN_PROGRESS') return { label: `${detail} · LIVE`, cls: 'nba-live' };
  if (s === 'STATUS_SCHEDULED') {
    try {
      const date = new Date(game.date);
      const phtTime = date.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit',
        timeZone: 'Asia/Manila', hour12: true,
      });
      return { label: `${phtTime} PHT`, cls: 'nba-upcoming' };
    } catch {
      return { label: detail, cls: 'nba-upcoming' };
    }
  }
  return { label: detail, cls: 'nba-upcoming' };
}

async function fetchPlayerStats(gameId: string): Promise<PlayerStat[]> {
  const res = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`
  );
  const data = await res.json();
  const players: PlayerStat[] = [];
  const boxscore = data?.boxscore?.players || [];
  for (const teamData of boxscore) {
    const teamAbbr = teamData?.team?.abbreviation || '';
    const statistics = teamData?.statistics?.[0];
    if (!statistics) continue;
    const labels: string[] = statistics.labels || [];
    const minIdx = labels.indexOf('MIN');
    const ptsIdx = labels.indexOf('PTS');
    const astIdx = labels.indexOf('AST');
    const rebIdx = labels.indexOf('REB');
    const stlIdx = labels.indexOf('STL');
    const blkIdx = labels.indexOf('BLK');
    const fgIdx = labels.indexOf('FG');
    const threeptIdx = labels.indexOf('3PT');
    const ftIdx = labels.indexOf('FT');
    for (const athlete of statistics.athletes || []) {
      const stats = athlete.stats || [];
      if (!stats.length) continue;
      players.push({
        name: athlete.athlete?.displayName || '',
        team: teamAbbr,
        min: minIdx >= 0 ? stats[minIdx] : '0',
        pts: ptsIdx >= 0 ? stats[ptsIdx] : '0',
        ast: astIdx >= 0 ? stats[astIdx] : '0',
        reb: rebIdx >= 0 ? stats[rebIdx] : '0',
        stl: stlIdx >= 0 ? stats[stlIdx] : '0',
        blk: blkIdx >= 0 ? stats[blkIdx] : '0',
        fg: fgIdx >= 0 ? stats[fgIdx] : '0',
        threept: threeptIdx >= 0 ? stats[threeptIdx] : '0',
        ft: ftIdx >= 0 ? stats[ftIdx] : '0',
      });
    }
  }
  return players.sort((a, b) => parseFloat(b.pts) - parseFloat(a.pts));
}

async function fetchSingleGame(gameId: string, dateStr: string): Promise<Game | null> {
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${dateStr}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const games = parseGames(data);
    return games.find(g => g.id === gameId) || null;
  } catch {
    return null;
  }
}

export default function NbaToday() {
  const [yesterdayGames, setYesterdayGames] = useState<Game[]>([]);
  const [todayGames, setTodayGames] = useState<Game[]>([]);
  const [tomorrowGames, setTomorrowGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [dayOffset, setDayOffset] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const swiperRef = useRef<any>(null);
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeIndexRef = useRef(0);
  const dayOffsetRef = useRef(0);
  const gamesRef = useRef<{ yesterday: Game[]; today: Game[]; tomorrow: Game[] }>({
    yesterday: [],
    today: [],
    tomorrow: [],
  });

  const [statsOpen, setStatsOpen] = useState(false);
  const [statsGame, setStatsGame] = useState<Game | null>(null);
  const [statsData, setStatsData] = useState<PlayerStat[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsTab, setStatsTab] = useState<string>('');

  // Keep refs in sync
  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);
  useEffect(() => { dayOffsetRef.current = dayOffset; }, [dayOffset]);
  useEffect(() => { gamesRef.current.yesterday = yesterdayGames; }, [yesterdayGames]);
  useEffect(() => { gamesRef.current.today = todayGames; }, [todayGames]);
  useEffect(() => { gamesRef.current.tomorrow = tomorrowGames; }, [tomorrowGames]);

  // Lock scroll when stats panel is open
  useEffect(() => {
    document.body.style.overflow = statsOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [statsOpen]);

  const updateGameInState = (updatedGame: Game, offset: number) => {
    const setter =
      offset === -1 ? setYesterdayGames :
      offset === 0 ? setTodayGames :
      setTomorrowGames;
    setter(prev => prev.map(g => g.id === updatedGame.id ? updatedGame : g));
  };

  const openStats = async (game: Game) => {
    setStatsGame(game);
    setStatsOpen(true);
    setStatsLoading(true);
    setStatsTab(game.away.abbreviation);
    try {
      const players = await fetchPlayerStats(game.id);
      setStatsData(players);
      setStatsTab(players[0]?.team || game.away.abbreviation);
    } catch {
      setStatsData([]);
    } finally {
      setStatsLoading(false);
    }
  };

  const closeStats = () => {
    setStatsOpen(false);
    setStatsGame(null);
    setStatsData([]);
  };

  // On first load only: slide to live game
  const slideToLiveOnce = (games: Game[]) => {
    if (!swiperRef.current) return;
    const liveIndex = games.findIndex(g => g.status === 'STATUS_IN_PROGRESS');
    if (liveIndex !== -1) {
      swiperRef.current.slideTo(liveIndex);
      setActiveIndex(liveIndex);
    }
  };

  // After refresh: restore the user's current slide position
  const restoreSlide = (index: number) => {
    if (!swiperRef.current) return;
    setTimeout(() => swiperRef.current?.slideTo(index, 0), 100);
  };

  const stopAutoRefresh = () => {
    if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
      autoRefreshRef.current = null;
    }
  };

  // Smart per-game auto refresh: only fetches the active game if it's live
  const startSmartAutoRefresh = () => {
    stopAutoRefresh();
    autoRefreshRef.current = setInterval(async () => {
      const offset = dayOffsetRef.current;
      const idx = activeIndexRef.current;
      const games =
        offset === -1 ? gamesRef.current.yesterday :
        offset === 0 ? gamesRef.current.today :
        gamesRef.current.tomorrow;

      const activeGame = games[idx];
      if (!activeGame || activeGame.status !== 'STATUS_IN_PROGRESS') return;

      const dateStr = getDateStrForTab(offset);
      const updated = await fetchSingleGame(activeGame.id, dateStr);
      if (updated) {
        updateGameInState(updated, offset);
        // Restore slide position after state update
        setTimeout(() => restoreSlide(idx), 50);
      }
    }, 30 * 1000);
  };

  const fetchGames = async (isAuto = false) => {
    if (!isAuto && cooldown) return;

    // Remember where the user is before refreshing
    const savedIndex = activeIndexRef.current;
    const savedOffset = dayOffsetRef.current;

    if (!isAuto) {
      setCooldown(true);
      setSeconds(60);
      const timer = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) { clearInterval(timer); setCooldown(false); return 0; }
          return s - 1;
        });
      }, 1000);
    }

    setLoading(true);
    setError('');
    try {
      const [yRes, tRes, tmRes] = await Promise.all([
        fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${getDateStrForTab(-1)}`),
        fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${getDateStrForTab(0)}`),
        fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${getDateStrForTab(1)}`),
      ]);
      const checkRes = async (res: Response) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      };
      const [yData, tData, tmData] = await Promise.all([
        checkRes(yRes), checkRes(tRes), checkRes(tmRes),
      ]);
      const parsedToday = parseGames(tData);
      setYesterdayGames(parseGames(yData));
      setTodayGames(parsedToday);
      setTomorrowGames(parseGames(tmData));

      if (isAuto) {
        // First ever load: go to live game if on today tab
        if (savedOffset === 0) {
          setTimeout(() => slideToLiveOnce(parsedToday), 100);
        }
      } else {
        // Manual refresh: go back to where user was
        setTimeout(() => restoreSlide(savedIndex), 100);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames(true);
    startSmartAutoRefresh();
    return () => stopAutoRefresh();
  }, []);

  // Restart smart refresh whenever the user swipes or changes day tab
  useEffect(() => {
    startSmartAutoRefresh();
  }, [activeIndex, dayOffset]);

  const displayGames =
    dayOffset === -1 ? yesterdayGames :
    dayOffset === 0 ? todayGames :
    tomorrowGames;

  const noGamesLabel =
    dayOffset === -1 ? 'yesterday' :
    dayOffset === 0 ? 'today' : 'tomorrow';

  const activeGame = displayGames[activeIndex];
  const activeGameIsLive = activeGame?.status === 'STATUS_IN_PROGRESS';

  const filteredStats = statsData.filter(p => p.team === statsTab);

  return (
    <div className="nba-wrapper">
      <div className="nba-header">
        <div className="nba-header-left">
          <span className="nba-dot" />
          <span className="nba-title">NBA</span>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="flex rounded-lg overflow-hidden" style={{ border: '0.5px solid #e63946' }}>
            {[-1, 0, 1].map((offset, i) => (
              <button
                key={offset}
                onClick={() => setDayOffset(offset)}
                className={`DayNba px-2 py-1 font-medium transition-all ${
                  dayOffset === offset
                    ? 'bg-[#db6163] text-white'
                    : 'bg-transparent text-[#8892a4] hover:text-[#db6163]'
                }`}
              >
                {['Yesterday', 'Today', 'Tomorrow'][i]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeGameIsLive && (
            <div className="flex items-center gap-1" title="Auto-refreshing this game every 30s">
              <span className="animate-ping [animation-duration:2s] inline-flex w-2 h-2 rounded-full bg-[#22c55e] opacity-75" />
              <span className="text-xs text-[#22c55e] hidden sm:inline">Tracking</span>
            </div>
          )}
          <button
            className="nba-refresh"
            onClick={() => fetchGames(false)}
            disabled={cooldown}
            title={cooldown ? `Wait ${seconds}s` : 'Refresh all games'}
          >
            <FontAwesomeIcon
              icon={faArrowsRotate}
              style={{ fontSize: 'clamp(0.8rem, 1vw + 0.5rem, 0.9rem)' }}
              className={cooldown ? 'opacity-30' : ''}
            />
            {cooldown && <span className="ml-1 text-xs text-[#8892a4]">{seconds}s</span>}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="w-8 h-8 rounded-full border-2 border-[#121212] border-t-[#db6163] animate-spin" />
        </div>
      )}
      {error && <p className="nba-error">Error: {error}</p>}
      {!loading && !error && displayGames.length === 0 && (
        <p className="nba-msg">No games {noGamesLabel}.</p>
      )}
      {!loading && !error && displayGames.length > 0 && (
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          slideToClickedSlide={true}
          coverflowEffect={{ rotate: 50, stretch: 0, depth: 100, modifier: 1, slideShadows: true }}
          pagination={{ clickable: true }}
          modules={[EffectCoverflow, Pagination]}
          className="nba-swiper"
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          {displayGames.map((g, idx) => {
            const { label, cls } = getStatusInfo(g);
            const isUpcoming = g.status === 'STATUS_SCHEDULED';
            const isLive = g.status === 'STATUS_IN_PROGRESS';
            const canShowStats = g.status !== 'STATUS_SCHEDULED';
            const isActiveSlide = idx === activeIndex;
            return (
              <SwiperSlide key={g.id} className="nba-slide">
                <div className={`nba-card ${isLive ? 'ring-1 ring-[#e63946]' : ''}`}>
                  <div className="flex flex-col items-center w-full gap-3">
                    {isLive ? (
                      <div className="flex items-center gap-2 border-l-2 border-[#db6163] bg-[rgba(18,18,18,0.50)] p-3 rounded-r-md">
                        <span className="animate-ping [animation-duration:1.5s] inline-flex w-2 h-2 rounded-full bg-[#ff0015] opacity-75" />
                        <span className="liveIndicator text-[#ffffff] font-medium tracking-widest uppercase">Live</span>
                      </div>
                    ) : (
                      <div className="h-4" />
                    )}

                    <div className="nba-teams-row w-full">
                      <div className="nba-team">
                        <img src={g.away.logo} alt={g.away.abbreviation} style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
                        <span className="nba-abbr">{g.away.abbreviation}</span>
                        <span className="nba-name">{g.away.displayName}</span>
                      </div>
                      <div className="nba-score-block">
                        <div className="nba-scores">
                          <span className="nba-score">{isUpcoming ? '—' : g.away.score}</span>
                          <span className="nba-vs">VS</span>
                          <span className="nba-score">{isUpcoming ? '—' : g.home.score}</span>
                        </div>
                        <span className={`nba-pill ${cls}`}>{label}</span>
                      </div>
                      <div className="nba-team">
                        <img src={g.home.logo} alt={g.home.abbreviation} style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
                        <span className="nba-abbr">{g.home.abbreviation}</span>
                        <span className="nba-name">{g.home.displayName}</span>
                      </div>
                    </div>

                    {canShowStats && (
                      <button onClick={() => openStats(g)} className="stats-btn">
                        Stats -
                        <span>
                          <FontAwesomeIcon
                            icon={faBoltLightning}
                            style={{ fontSize: 'clamp(0.8rem, 1vw + 0.5rem, 0.9rem)', color: '#fffb03' }}
                          />
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}

      {statsOpen && (
        <>
          <div className="stats-backdrop" onClick={closeStats} />
          <div className="stats-panel">
            <div className="stats-handle" />
            <div className="stats-panel-header">
              <div>
                <p className="stats-panel-title">
                  {statsGame?.away.abbreviation} vs {statsGame?.home.abbreviation}
                </p>
              </div>
              <button onClick={closeStats} className="stats-close">✕</button>
            </div>

            <div className="stats-tabs">
              {[statsGame?.away, statsGame?.home].map((team) => (
                <button
                  key={team?.abbreviation}
                  onClick={() => setStatsTab(team?.abbreviation || '')}
                  className={`stats-tab-btn ${statsTab === team?.abbreviation ? 'stats-tab-active' : 'stats-tab-inactive'}`}
                >
                  <img src={team?.logo} alt={team?.abbreviation} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                  {team?.abbreviation}
                </button>
              ))}
            </div>

            {statsLoading && (
              <div className="stats-loading">
                <div className="w-8 h-8 rounded-full border-2 border-[#121212] border-t-[#db6163] animate-spin" />
              </div>
            )}

            {!statsLoading && filteredStats.length === 0 && (
              <p className="stats-empty">No stats available yet.</p>
            )}

            {!statsLoading && filteredStats.length > 0 && (
              <div className="stats-table-wrapper">
                <table className="stats-table">
                  <thead>
                    <tr className="stats-table-head">
                      <th className="stats-th-player rounded-l-lg">Player</th>
                      <th className="stats-th">MIN</th>
                      <th className="stats-th">PTS</th>
                      <th className="stats-th">AST</th>
                      <th className="stats-th">REB</th>
                      <th className="stats-th">STL</th>
                      <th className="stats-th">BLK</th>
                      <th className="stats-th">FG</th>
                      <th className="stats-th">3PT</th>
                      <th className="stats-th rounded-r-lg">FT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStats.map((p, i) => (
                      <tr key={i} className="stats-row">
                        <td className="stats-td-player">{p.name}</td>
                        <td className="stats-td">{p.min}</td>
                        <td className="stats-td-pts">{p.pts}</td>
                        <td className="stats-td">{p.ast}</td>
                        <td className="stats-td">{p.reb}</td>
                        <td className="stats-td">{p.stl}</td>
                        <td className="stats-td">{p.blk}</td>
                        <td className="stats-td px-0 lg:px-3">{p.fg}</td>
                        <td className="stats-td px-0 lg:px-3">{p.threept}</td>
                        <td className="stats-td px-0 lg:px-3">{p.ft}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}