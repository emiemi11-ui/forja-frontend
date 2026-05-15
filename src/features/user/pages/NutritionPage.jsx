import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getDashboard,
  getMeals,
  addMeal,
  addCustomFood,
  deleteMeal,
  searchFood,
  setWater,
} from '../../../shared/api/index.js';
import { isDemoSession, readStoredUser } from '../../auth/model/authStorage.js';
import ImageUploadButton from '../../../shared/ui/ImageUploadButton.jsx';
import { pct, Toast, useToast } from '../../../shared/ui/helpers.jsx';
import { AnimatedPage, HeroSection, AnimatedRing, AnimatedBar, ScrollReveal, CountUp, StaggerGrid } from '../../../shared/ui/animations/index.jsx';

const MEAL_TYPES = ['Mic dejun', 'Pranz', 'Cina', 'Gustare'];
const EMPTY_CUSTOM_FOOD = {
  name: '',
  quantity: '100g',
  kcal: '',
  p: '',
  c: '',
  f: '',
  recipe: '',
  img: '',
};

function numberValue(value) {
  return Math.max(0, Number(value) || 0);
}

export default function Nutrition() {
  const [dash, setDash] = useState(null);
  const [meals, setMeals] = useState([]);
  const [foods, setFoods] = useState([]);
  const [query, setQuery] = useState('');
  const [mealCtx, setMealCtx] = useState('Mic dejun');
  const [customOpen, setCustomOpen] = useState(false);
  const [customFood, setCustomFood] = useState(EMPTY_CUSTOM_FOOD);
  const [savingCustom, setSavingCustom] = useState(false);
  const { toast, showToast } = useToast();

  const demoMode = isDemoSession() || readStoredUser()?.isDemo === true;

  const load = useCallback(async () => {
    const [d, m] = await Promise.all([getDashboard(), getMeals()]);
    setDash(d.data);
    setMeals(m.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = async (value) => {
    setQuery(value);
    if (!value.trim()) {
      setFoods([]);
      return;
    }
    try {
      const response = await searchFood(value);
      setFoods(Array.isArray(response.data) ? response.data : []);
    } catch {
      setFoods([]);
    }
  };

  const handleAdd = async (food) => {
    try {
      await addMeal(food.id, mealCtx);
      showToast(`${food.name} adăugat`);
      setQuery('');
      setFoods([]);
      await load();
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Nu am putut adăuga alimentul.', '❌');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMeal(id);
      await load();
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Nu am putut șterge alimentul.', '❌');
    }
  };

  const handleWater = async (cups) => {
    try {
      await setWater(cups);
      await load();
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Nu am putut salva hidratarea.', '❌');
    }
  };

  const updateCustomFood = (field, value) => {
    setCustomFood((prev) => ({ ...prev, [field]: value }));
  };

  const resetCustomFood = () => {
    setCustomFood(EMPTY_CUSTOM_FOOD);
    setCustomOpen(false);
  };

  const handleCustomSubmit = async () => {
    if (!customFood.name.trim()) {
      showToast('Completează numele alimentului.', '⚠️');
      return;
    }

    setSavingCustom(true);
    try {
      const payload = {
        name: customFood.name.trim(),
        quantity: customFood.quantity.trim() || '1 porție',
        kcal: numberValue(customFood.kcal),
        p: numberValue(customFood.p),
        c: numberValue(customFood.c),
        f: numberValue(customFood.f),
        recipe: customFood.recipe.trim(),
        img: customFood.img || '',
      };
      const { data: createdFood } = await addCustomFood(payload);
      await addMeal(createdFood.id, mealCtx);
      showToast(`✅ ${createdFood.name} a fost adăugat la ${mealCtx}.`);
      resetCustomFood();
      await load();
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Nu am putut salva alimentul custom.', '❌');
    } finally {
      setSavingCustom(false);
    }
  };

  const handleCustomKeyDown = (event) => {
    if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
      event.preventDefault();
      handleCustomSubmit();
    }
  };

  if (!dash) {
    return (
      <AnimatedPage>
        <div className="forja-skeleton" style={{ height: 180, borderRadius: 20, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map((i) => <div key={i} className="forja-skeleton" style={{ height: 120, borderRadius: 16 }} />)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map((i) => <div key={i} className="forja-skeleton" style={{ height: 100, borderRadius: 16 }} />)}
          </div>
        </div>
      </AnimatedPage>
    );
  }

  const { today, macros } = dash;
  const goals = dash.goals || {};
  const cups = today.water_cups || 0;
  const waterTargetLiters = today.waterTargetLiters || today.water_target_liters || goals.water || 3;
  const waterTargetCups = today.waterTargetCups || today.water_target_cups || Math.max(4, Math.round(waterTargetLiters * 4));
  const waterLiters = today.waterLiters || today.water_liters || Number((cups / 4).toFixed(1));
  const kcalLeft = (goals.kcal || 2100) - macros.kcal;
  const grouped = MEAL_TYPES.reduce((acc, mealType) => {
    acc[mealType] = meals.filter((meal) => (meal.meal || meal.mealType) === mealType);
    return acc;
  }, {});

  return (
    <AnimatedPage>
      <Toast toast={toast} />

      <HeroSection
        imageSrc="/img/ext/role-nutritionist-demo.jpg"
        accentColor="rgba(255,68,34,0.08)"
        style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 24, alignItems: 'center', minHeight: 180 }}
      >
        <AnimatedRing value={macros.kcal} max={goals.kcal || 2000} size={110} strokeWidth={8} color="#FF4422" bgColor="var(--hero-card-bg)">
          <CountUp to={pct(macros.kcal, goals.kcal)} suffix="%" className="score-glow" style={{ fontFamily: 'var(--fd)', fontSize: 24, fontWeight: 900, color: '#B8ED00', lineHeight: 1 }} />
          <div style={{ fontFamily: 'var(--fm)', fontSize: 7, letterSpacing: 1, color: 'var(--hero-text3)' }}>KCAL</div>
        </AnimatedRing>

        <StaggerGrid style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { lbl: 'Proteine', val: macros.p, max: goals.protein, unit: 'g', color: '#1A52FF' },
            { lbl: 'Carbs', val: macros.c, max: goals.carbs, unit: 'g', color: '#B8ED00' },
            { lbl: 'Grasimi', val: macros.f, max: goals.fat, unit: 'g', color: '#FF4422' },
            { lbl: 'Fibre', val: macros.fib, max: 30, unit: 'g', color: '#15803D' },
          ].map((macro) => (
            <div key={macro.lbl} style={{ background: 'var(--hero-card-bg)', border: '1px solid var(--hero-card-bd)', borderRadius: 10, padding: 12 }}>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--hero-text3)', marginBottom: 4 }}>{macro.lbl}</div>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 24, fontWeight: 900, color: 'var(--hero-text)', lineHeight: 1 }}>
                <CountUp to={Math.round(macro.val)} />
                <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--hero-text3)' }}>{macro.unit}</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--hero-text3)', marginTop: 1 }}>din {macro.max}{macro.unit}</div>
              <div style={{ height: 3, background: 'var(--hero-card-bg)', borderRadius: 2, overflow: 'hidden', marginTop: 7 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct(macro.val, macro.max)}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ height: '100%', borderRadius: 2, background: macro.color }}
                />
              </div>
            </div>
          ))}
        </StaggerGrid>
      </HeroSection>

      <div className="nut-layout">
        <div>
          <ScrollReveal>
            <div className="card card-glow" style={{ marginBottom: 14 }}>
              <div className="card-hd">
                <span className="card-hd-title">Adaugă aliment</span>
                <span style={{ fontFamily: 'var(--fm)', fontSize: 9, color: 'var(--c-ink3)' }}>la {mealCtx}</span>
              </div>
              <div style={{ padding: 16 }}>
                <input
                  className="inp"
                  value={query}
                  onChange={(event) => handleSearch(event.target.value)}
                  placeholder="Caută aliment (ex: pui, ouă, avocado)..."
                  style={{ marginBottom: 10 }}
                />

                <AnimatePresence>
                  {foods.length > 0 && (
                    <motion.div className="food-results" initial={{ opacity: 0, y: -8, maxHeight: 0 }} animate={{ opacity: 1, y: 0, maxHeight: 240 }} exit={{ opacity: 0, y: -8, maxHeight: 0 }}>
                      {foods.map((food, index) => (
                        <motion.div
                          key={food.id}
                          className="fr-item"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.04 }}
                          onClick={() => handleAdd(food)}
                        >
                          <span className="fr-icon" style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'var(--c-border)' }}>
                            {food.img ? <img src={food.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : food.icon || '🍽️'}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="fr-nm" style={{ color: 'var(--c-ink)', fontWeight: 700 }}>{food.name}</div>
                            <div className="fr-macros">P {food.p}g / C {food.c}g / F {food.f}g</div>
                          </div>
                          <span className="fr-kcal">{food.kcal} kcal</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                  {MEAL_TYPES.map((type) => (
                    <motion.button key={type} className={`chip${mealCtx === type ? ' on' : ''}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setMealCtx(type)}>
                      {type}
                    </motion.button>
                  ))}
                </div>

                {/* Custom food - vizibil pentru toți utilizatorii */}
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed var(--c-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--c-ink)' }}>Alimentul meu</div>

                      </div>
                      <button className="btn btn-outline btn-sm" onClick={() => setCustomOpen((prev) => !prev)}>
                        {customOpen ? 'Ascunde' : '+ Adaugă alimentul meu'}
                      </button>
                    </div>

                    <AnimatePresence>
                      {customOpen && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={{ display: 'grid', gap: 10 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                            <input className="inp" value={customFood.name} onChange={(event) => updateCustomFood('name', event.target.value)} onKeyDown={handleCustomKeyDown} placeholder="Denumire aliment / rețetă" />
                            <input className="inp" value={customFood.quantity} onChange={(event) => updateCustomFood('quantity', event.target.value)} onKeyDown={handleCustomKeyDown} placeholder="Cantitate (ex: 150g / 1 porție)" />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 10 }}>
                            <input className="inp" type="number" min="0" value={customFood.kcal} onChange={(event) => updateCustomFood('kcal', event.target.value)} onKeyDown={handleCustomKeyDown} placeholder="kcal" />
                            <input className="inp" type="number" min="0" value={customFood.p} onChange={(event) => updateCustomFood('p', event.target.value)} onKeyDown={handleCustomKeyDown} placeholder="P" />
                            <input className="inp" type="number" min="0" value={customFood.c} onChange={(event) => updateCustomFood('c', event.target.value)} onKeyDown={handleCustomKeyDown} placeholder="C" />
                            <input className="inp" type="number" min="0" value={customFood.f} onChange={(event) => updateCustomFood('f', event.target.value)} onKeyDown={handleCustomKeyDown} placeholder="F" />
                          </div>

                          <ImageUploadButton currentImage={customFood.img} onImageSelect={(value) => updateCustomFood('img', value || '')} onRemove={() => updateCustomFood('img', '')} label="Încarcă poza alimentului tău" />

                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button className="btn btn-outline btn-sm" onClick={resetCustomFood}>Resetează</button>
                            <button className="btn btn-lime btn-sm" onClick={handleCustomSubmit} disabled={savingCustom}>
                              {savingCustom ? 'Se adaugă...' : `+ Adaugă la ${mealCtx}`}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
              </div>
            </div>
          </ScrollReveal>

          {MEAL_TYPES.map((type, index) => (
            <ScrollReveal key={type} delay={index * 0.08}>
              <div className="meal-sec" style={{ marginBottom: 12 }}>
                <div className="ms-header">
                  <span className="ms-title">{type}</span>
                  <span className="ms-kcal">{grouped[type].reduce((sum, meal) => sum + meal.kcal, 0)} kcal</span>
                </div>
                {grouped[type].length === 0 ? (
                  <div style={{ padding: '12px 18px', fontSize: 12, color: 'var(--c-ink3)', fontStyle: 'italic' }}>Nimic înregistrat</div>
                ) : grouped[type].map((meal, mealIndex) => (
                  <motion.div key={meal.id} className="food-row" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: mealIndex * 0.05 }} whileHover={{ x: 4, background: 'var(--c-lime-bg)' }}>
                    <span className="food-icon" style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'var(--c-border)' }}>
                      {meal.img ? <img src={meal.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : meal.icon || '🍽️'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="food-nm" style={{ color: 'var(--c-ink)', fontWeight: 700 }}>{meal.name}</div>
                      <div className="food-meta">P {meal.p || meal.protein}g / C {meal.c || meal.carbs}g / F {meal.f || meal.fat}g</div>
                    </div>
                    <span className="food-kcal">{meal.kcal}</span>
                    <motion.button className="food-rm" whileHover={{ scale: 1.2, color: 'var(--c-coral)' }} onClick={() => handleDelete(meal.id)}>✕</motion.button>
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div>
          <ScrollReveal direction="right">
            <div className="n-side-card card-inner-glow">
              <div className="sec-lbl">Hidratare</div>
              <div className="ns-val" style={{ color: 'var(--c-blue)' }}>
                <CountUp to={waterLiters} decimals={1} suffix="" />
                <span style={{ fontSize: 18, fontWeight: 400, color: 'var(--c-ink3)' }}>L</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--c-ink3)' }}>din {waterTargetLiters}L target / {cups}/{waterTargetCups} cupe</div>
              <div className="cups-row">
                {Array.from({ length: waterTargetCups }, (_, index) => (
                  <motion.div key={index} className={`cup${index < cups ? ' f' : ''}`} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} onClick={() => handleWater(index + 1)}>
                    <img src="/img/water-drop.svg" alt="" style={{ width: 20, height: 26, opacity: index < cups ? 1 : 0.2, filter: index < cups ? 'none' : 'grayscale(1)', transition: 'all 0.3s' }} />
                  </motion.div>
                ))}
              </div>
              <AnimatedBar value={cups} max={waterTargetCups} height={6} color="#1A52FF" />
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.1}>
            <div className="n-side-card card-inner-glow">
              <div className="sec-lbl">Balanța calorică</div>
              <div className="ns-val" style={{ color: kcalLeft > 0 ? 'var(--c-green)' : 'var(--c-coral)' }}>
                <CountUp to={Math.abs(kcalLeft)} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--c-ink3)' }}>{kcalLeft > 0 ? `kcal rămase din ${goals.kcal}` : 'kcal peste target'}</div>
              <AnimatedBar value={macros.kcal} max={goals.kcal || 2100} height={6} color={kcalLeft > 0 ? '#15803D' : '#FF4422'} />
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.2}>
            <div className="n-side-card card-inner-glow">
              <div className="sec-lbl">Mese de azi</div>
              <div className="ns-val"><CountUp to={meals.length} /></div>
              <div style={{ fontSize: 11, color: 'var(--c-ink3)' }}>{MEAL_TYPES.filter((type) => grouped[type].length > 0).join(', ') || 'nicio masă'}</div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </AnimatedPage>
  );
}
