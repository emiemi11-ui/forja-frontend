import { useEffect, useMemo, useState } from 'react';
import { getNutTemplates, nutCreateTemplate, nutUpdateTemplate, nutDeleteTemplate, nutApplyTemplate, getNutClients, searchFood as searchFoodApi } from '../../../shared/api/index.js';
import { Toast, useToast } from '../../../shared/ui/helpers.jsx';
import { useConfirm } from '../../../shared/ui/ConfirmModal.jsx';
import Modal, { ModalActions } from '../../../shared/ui/Modal.jsx';
import ImageUploadButton from '../../../shared/ui/ImageUploadButton.jsx';
import { AnimatedPage } from '../../../shared/ui/animations/index.jsx';

const MEAL_TYPES = ['Mic dejun', 'Gustare 1', 'Prânz', 'Gustare 2', 'Cină', 'Pre-workout', 'Post-workout'];
const EMPTY_INGREDIENT = {
  name: '',
  quantity: '100g',
  kcal: '',
  p: '',
  c: '',
  f: '',
  img: '',
  note: '',
};

function toNumber(value) {
  return Math.max(0, Number(value) || 0);
}

function makeId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeIngredient(ingredient = {}) {
  return {
    id: ingredient.id || makeId('ing'),
    name: ingredient.name || '',
    quantity: ingredient.quantity || '1 porție',
    kcal: toNumber(ingredient.kcal),
    p: toNumber(ingredient.p ?? ingredient.protein),
    c: toNumber(ingredient.c ?? ingredient.carbs),
    f: toNumber(ingredient.f ?? ingredient.fat),
    img: ingredient.img || '',
    note: ingredient.note || '',
  };
}

function computeMealTotals(ingredients = []) {
  return ingredients.reduce((acc, ingredient) => {
    acc.kcal += toNumber(ingredient.kcal);
    acc.p += toNumber(ingredient.p);
    acc.c += toNumber(ingredient.c);
    acc.f += toNumber(ingredient.f);
    return acc;
  }, { kcal: 0, p: 0, c: 0, f: 0 });
}

function mealDisplayName(meal) {
  if (meal.name?.trim()) return meal.name.trim();
  const names = (meal.ingredients || []).map((ingredient) => ingredient.name).filter(Boolean);
  return names.slice(0, 3).join(' + ') || '(gol)';
}

function normalizeMeal(meal = {}, index = 0) {
  const ingredients = Array.isArray(meal.ingredients) && meal.ingredients.length
    ? meal.ingredients.map(normalizeIngredient)
    : meal.name
      ? [normalizeIngredient({
          name: meal.name,
          quantity: meal.quantity || '1 porție',
          kcal: meal.kcal,
          p: meal.p ?? meal.protein,
          c: meal.c ?? meal.carbs,
          f: meal.f ?? meal.fat,
          img: meal.img || '',
        })]
      : [];
  const totals = computeMealTotals(ingredients);
  return {
    id: meal.id || makeId(`meal-${index}`),
    type: meal.type || 'Mic dejun',
    name: meal.name || '',
    img: meal.img || ingredients.find((ingredient) => ingredient.img)?.img || '',
    recipe: meal.recipe || '',
    ingredients,
    kcal: totals.kcal || toNumber(meal.kcal),
    p: totals.p || toNumber(meal.p ?? meal.protein),
    c: totals.c || toNumber(meal.c ?? meal.carbs),
    f: totals.f || toNumber(meal.f ?? meal.fat),
  };
}

function syncMeal(meal) {
  const ingredients = Array.isArray(meal.ingredients) ? meal.ingredients.map(normalizeIngredient) : [];
  const totals = computeMealTotals(ingredients);
  return {
    ...meal,
    ingredients,
    kcal: totals.kcal,
    p: totals.p,
    c: totals.c,
    f: totals.f,
    img: meal.img || ingredients.find((ingredient) => ingredient.img)?.img || '',
  };
}

function roleCardImage(template) {
  return template.img || template.mealPlan?.find((meal) => meal.img)?.img || '';
}

export default function NutTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [clients, setClients] = useState([]);
  const [showApply, setShowApply] = useState(null);
  const [selectedClients, setSelectedClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editKcal, setEditKcal] = useState(2000);
  const [editP, setEditP] = useState(160);
  const [editC, setEditC] = useState(200);
  const [editF, setEditF] = useState(60);
  const [editMeals, setEditMeals] = useState([]);
  const [editingMealId, setEditingMealId] = useState(null);
  const [ingredientDrafts, setIngredientDrafts] = useState({});
  const [foodSearchByMeal, setFoodSearchByMeal] = useState({});
  const [foodResultsByMeal, setFoodResultsByMeal] = useState({});
  const [compact, setCompact] = useState(typeof window !== 'undefined' ? window.innerWidth <= 820 : false);
  const { toast, showToast } = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth <= 820);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const load = async () => {
    const [templatesResponse, clientsResponse] = await Promise.all([getNutTemplates(), getNutClients()]);
    setTemplates(Array.isArray(templatesResponse.data) ? templatesResponse.data : []);
    setClients(Array.isArray(clientsResponse.data) ? clientsResponse.data : []);
  };

  useEffect(() => {
    load();
  }, []);

  const draftForMeal = (mealId) => ingredientDrafts[mealId] || EMPTY_INGREDIENT;

  const setDraftForMeal = (mealId, patch) => {
    setIngredientDrafts((prev) => ({
      ...prev,
      [mealId]: { ...EMPTY_INGREDIENT, ...(prev[mealId] || {}), ...patch },
    }));
  };

  const resetDraftForMeal = (mealId) => {
    setIngredientDrafts((prev) => {
      const next = { ...prev };
      delete next[mealId];
      return next;
    });
  };

  const updateMeal = (mealId, patch) => {
    setEditMeals((prev) => prev.map((meal) => (meal.id === mealId ? syncMeal({ ...meal, ...patch }) : meal)));
  };

  const addMeal = (type) => {
    const nextMeal = normalizeMeal({ type, ingredients: [] }, editMeals.length);
    setEditMeals((prev) => [...prev, nextMeal]);
    setEditingMealId(nextMeal.id);
  };

  const removeMeal = (mealId) => {
    setEditMeals((prev) => prev.filter((meal) => meal.id !== mealId));
    if (editingMealId === mealId) setEditingMealId(null);
    resetDraftForMeal(mealId);
    setFoodSearchByMeal((prev) => {
      const next = { ...prev };
      delete next[mealId];
      return next;
    });
    setFoodResultsByMeal((prev) => {
      const next = { ...prev };
      delete next[mealId];
      return next;
    });
  };

  const addIngredientToMeal = (mealId, ingredient) => {
    const normalized = normalizeIngredient(ingredient);
    setEditMeals((prev) => prev.map((meal) => {
      if (meal.id !== mealId) return meal;
      return syncMeal({ ...meal, ingredients: [...(meal.ingredients || []), normalized] });
    }));
  };

  const removeIngredientFromMeal = (mealId, ingredientId) => {
    setEditMeals((prev) => prev.map((meal) => {
      if (meal.id !== mealId) return meal;
      return syncMeal({ ...meal, ingredients: (meal.ingredients || []).filter((ingredient) => ingredient.id !== ingredientId) });
    }));
  };

  const handleSearchFood = async (mealId, value) => {
    setFoodSearchByMeal((prev) => ({ ...prev, [mealId]: value }));
    if (!value.trim()) {
      setFoodResultsByMeal((prev) => ({ ...prev, [mealId]: [] }));
      return;
    }
    try {
      const { data } = await searchFoodApi(value.trim());
      setFoodResultsByMeal((prev) => ({ ...prev, [mealId]: Array.isArray(data) ? data : [] }));
    } catch {
      setFoodResultsByMeal((prev) => ({ ...prev, [mealId]: [] }));
    }
  };

  const addFoodToMeal = (mealId, food) => {
    addIngredientToMeal(mealId, {
      name: food.name,
      quantity: '1 porție',
      kcal: food.kcal,
      p: food.p || 0,
      c: food.c || 0,
      f: food.f || 0,
      img: food.img || '',
    });
    setFoodSearchByMeal((prev) => ({ ...prev, [mealId]: '' }));
    setFoodResultsByMeal((prev) => ({ ...prev, [mealId]: [] }));
  };

  const addCustomIngredient = (mealId) => {
    const draft = draftForMeal(mealId);
    if (!draft.name.trim()) {
      showToast('Completează numele ingredientului.', '⚠️');
      return;
    }
    addIngredientToMeal(mealId, draft);
    resetDraftForMeal(mealId);
  };

  const openEditor = (template) => {
    if (template) {
      setEditingTemplateId(template.id);
      setEditName(template.name || template.nm || '');
      setEditKcal(template.kcal || 2000);
      setEditP(template.p ?? template.protein ?? 160);
      setEditC(template.c ?? template.carbs ?? 200);
      setEditF(template.f ?? template.fat ?? 60);
      const normalizedMeals = (Array.isArray(template.mealPlan) ? template.mealPlan : []).map(normalizeMeal);
      setEditMeals(normalizedMeals);
      setEditingMealId(normalizedMeals[0]?.id || null);
    } else {
      setEditingTemplateId(null);
      setEditName('');
      setEditKcal(2000);
      setEditP(160);
      setEditC(200);
      setEditF(60);
      setEditMeals([]);
      setEditingMealId(null);
    }
    setIngredientDrafts({});
    setFoodSearchByMeal({});
    setFoodResultsByMeal({});
    setShowEditor(true);
  };

  const totalMealKcal = useMemo(() => editMeals.reduce((sum, meal) => sum + (meal.kcal || 0), 0), [editMeals]);

  const handleSave = async () => {
    if (!editName.trim()) {
      showToast('Introdu un nume pentru template.', '⚠️');
      return;
    }

    setLoading(true);
    try {
      const mealPlan = editMeals.map((meal) => {
        const synced = syncMeal(meal);
        return {
          id: synced.id,
          type: synced.type,
          name: mealDisplayName(synced),
          kcal: synced.kcal,
          p: synced.p,
          c: synced.c,
          f: synced.f,
          img: synced.img || '',
          recipe: synced.recipe || '',
          ingredients: (synced.ingredients || []).map((ingredient) => ({
            id: ingredient.id,
            name: ingredient.name,
            quantity: ingredient.quantity,
            kcal: ingredient.kcal,
            p: ingredient.p,
            c: ingredient.c,
            f: ingredient.f,
            img: ingredient.img || '',
            note: ingredient.note || '',
          })),
        };
      });

      const payload = {
        name: editName.trim(),
        kcal: editKcal,
        p: editP,
        c: editC,
        f: editF,
        description: '',
        img: mealPlan.find((meal) => meal.img)?.img || '',
        mealPlan,
      };

      if (editingTemplateId) {
        await nutUpdateTemplate(editingTemplateId, payload);
        showToast('✅ Template actualizat!');
      } else {
        await nutCreateTemplate(payload);
        showToast('✅ Template creat!');
      }
      setShowEditor(false);
      setEditingTemplateId(null);
      await load();
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Eroare la salvare', '❌');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = (template) => {
    confirm(
      `Șterge template-ul "${template.name || 'acesta'}"? Va dispărea definitiv. Clienții care îl au asignat își vor păstra mesele deja înregistrate, dar nu vor mai vedea planul ca activ.`,
      async () => {
        try {
          await nutDeleteTemplate(template.id);
          showToast('🗑️ Template șters');
          await load();
        } catch (error) {
          showToast(error.response?.data?.error || '❌ Eroare la ștergere', '❌');
        }
      },
    );
  };

  const handleApply = async () => {
    if (!selectedClients.length) {
      showToast('Selectează cel puțin un client.', '⚠️');
      return;
    }
    setLoading(true);
    try {
      await nutApplyTemplate(showApply.id, selectedClients);
      showToast(`✅ Plan aplicat la ${selectedClients.length} client(i)!`);
      setShowApply(null);
      setSelectedClients([]);
      await load();
    } catch (error) {
      showToast(error.response?.data?.error || '❌ Eroare', '❌');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <Toast toast={toast} />

      {showEditor && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: compact ? 'stretch' : 'center', justifyContent: 'center', padding: compact ? 0 : 20 }} onClick={() => setShowEditor(false)}>
          <div style={{ background: 'var(--c-surface)', borderRadius: compact ? 0 : 20, width: '100%', maxWidth: compact ? '100%' : 860, height: compact ? '100%' : 'auto', maxHeight: compact ? '100dvh' : '92vh', overflow: 'auto', boxShadow: compact ? 'none' : '0 40px 100px rgba(0,0,0,0.3)' }} onClick={(event) => event.stopPropagation()}>
            <div style={{ position: 'sticky', top: 0, zIndex: 3, padding: compact ? '18px 18px 14px' : '22px 28px 16px', borderBottom: '1px solid var(--c-border)', background: 'var(--c-surface)' }}>
              <div style={{ fontFamily: 'var(--fd)', fontSize: compact ? 22 : 26, fontWeight: 900 }}>🍽️ Editor plan nutriție</div>
              <div style={{ fontSize: 12, color: 'var(--c-ink3)', marginTop: 4 }}>Poți crea rețete proprii, ingrediente proprii, cantități și poze pentru fiecare masă.</div>
            </div>

            <div style={{ padding: compact ? '16px 18px 88px' : '20px 28px 104px' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', display: 'block', marginBottom: 4 }}>Nume template *</label>
                <input value={editName} onChange={(event) => setEditName(event.target.value)} placeholder="ex: High Protein 2200kcal" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--c-border)', fontSize: 16, fontFamily: 'var(--fd)', fontWeight: 800, background: 'var(--c-bg)', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: compact ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
                {[
                  ['🔥 KCAL', editKcal, setEditKcal],
                  ['🥩 Proteine (g)', editP, setEditP],
                  ['🍚 Carbs (g)', editC, setEditC],
                  ['🥑 Grăsimi (g)', editF, setEditF],
                ].map(([label, value, setter]) => (
                  <div key={label}>
                    <label style={{ fontFamily: 'var(--fm)', fontSize: 8, letterSpacing: 1, color: 'var(--c-ink3)', display: 'block', marginBottom: 4 }}>{label}</label>
                    <input type="number" value={value} onChange={(event) => setter(parseInt(event.target.value, 10) || 0)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--c-border)', textAlign: 'center', fontSize: 18, fontWeight: 900, fontFamily: 'var(--fd)', background: 'var(--c-bg)', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>

              <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--c-ink3)', marginBottom: 8 }}>
                MESE ({editMeals.length}) · {totalMealKcal} KCAL TOTAL
              </div>

              {editMeals.map((meal) => {
                const isOpen = editingMealId === meal.id;
                const draft = draftForMeal(meal.id);
                const mealSearch = foodSearchByMeal[meal.id] || '';
                const mealResults = foodResultsByMeal[meal.id] || [];
                return (
                  <div key={meal.id} style={{ border: '1px solid var(--c-border)', borderRadius: 14, marginBottom: 12, overflow: 'hidden', background: isOpen ? 'var(--c-lime-bg)' : 'var(--c-surface)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', cursor: 'pointer', flexWrap: compact ? 'wrap' : 'nowrap' }} onClick={() => setEditingMealId(isOpen ? null : meal.id)}>
                      {meal.img ? <img src={meal.img} alt="" style={{ width: 42, height: 42, borderRadius: 10, objectFit: 'cover' }} /> : <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--c-bg)', display: 'grid', placeItems: 'center' }}>🍽️</div>}
                      <div style={{ flex: 1, minWidth: 150 }}>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>{meal.type}: {mealDisplayName(meal)}</div>
                        <div style={{ fontSize: 11, color: 'var(--c-ink3)' }}>{meal.kcal} kcal · P:{meal.p}g · C:{meal.c}g · F:{meal.f}g · {(meal.ingredients || []).length} ingrediente</div>
                      </div>
                      <button onClick={(event) => { event.stopPropagation(); removeMeal(meal.id); }} style={{ background: 'none', border: 'none', color: 'var(--c-coral)', cursor: 'pointer', fontSize: 16 }}>✕</button>
                    </div>

                    {isOpen && (
                      <div style={{ padding: '12px 14px 14px', borderTop: '1px solid var(--c-border)', background: 'var(--c-bg)', display: 'grid', gap: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1.1fr 0.9fr', gap: 12 }}>
                          <div>
                            <label style={{ fontSize: 10, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Nume masă / rețetă</label>
                            <input value={meal.name} onChange={(event) => updateMeal(meal.id, { name: event.target.value })} placeholder="ex: Bowl proteic cu pui și orez" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--c-border)', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: 10, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Poza preparatului</label>
                            <ImageUploadButton currentImage={meal.img} onImageSelect={(value) => updateMeal(meal.id, { img: value || '' })} onRemove={() => updateMeal(meal.id, { img: '' })} label="Încarcă poza rețetei" compact={compact} />
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: 10, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Caută în biblioteca demo</label>
                          <input value={mealSearch} onChange={(event) => handleSearchFood(meal.id, event.target.value)} placeholder="🔍 Caută aliment: pui, orez, somon..." style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--c-lime)', boxSizing: 'border-box', background: 'var(--c-surface)' }} />
                          {mealResults.length > 0 && (
                            <div style={{ border: '1px solid var(--c-border)', borderRadius: 10, maxHeight: 180, overflow: 'auto', background: 'var(--c-surface)', marginTop: 8 }}>
                              {mealResults.map((food) => (
                                <div key={food.id} onClick={() => addFoodToMeal(meal.id, food)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', cursor: 'pointer', borderBottom: '1px solid var(--c-border)', fontSize: 12, flexWrap: compact ? 'wrap' : 'nowrap' }} onMouseEnter={(event) => { event.currentTarget.style.background = 'var(--c-lime-bg)'; }} onMouseLeave={(event) => { event.currentTarget.style.background = 'transparent'; }}>
                                  {food.img ? <img src={food.img} alt="" style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover' }} /> : <span>🍽️</span>}
                                  <div style={{ flex: 1, minWidth: 120 }}><b>{food.name}</b></div>
                                  <span style={{ color: 'var(--c-ink3)' }}>{food.kcal} kcal · P:{food.p}g</span>
                                  <span style={{ color: 'var(--c-lime-d)', fontWeight: 800 }}>+</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div style={{ border: '1px dashed var(--c-border)', borderRadius: 12, padding: 12, background: 'var(--c-surface)' }}>
                          <div style={{ fontWeight: 800, marginBottom: 8 }}>Ingredientul meu</div>
                          <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1.1fr 0.9fr', gap: 10, marginBottom: 10 }}>
                            <input value={draft.name} onChange={(event) => setDraftForMeal(meal.id, { name: event.target.value })} placeholder="Denumire ingredient" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--c-border)', boxSizing: 'border-box' }} />
                            <input value={draft.quantity} onChange={(event) => setDraftForMeal(meal.id, { quantity: event.target.value })} placeholder="Cantitate (ex: 150g / 2 buc)" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--c-border)', boxSizing: 'border-box' }} />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 10, marginBottom: 10 }}>
                            <input type="number" min="0" value={draft.kcal} onChange={(event) => setDraftForMeal(meal.id, { kcal: event.target.value })} placeholder="kcal" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--c-border)', boxSizing: 'border-box' }} />
                            <input type="number" min="0" value={draft.p} onChange={(event) => setDraftForMeal(meal.id, { p: event.target.value })} placeholder="P" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--c-border)', boxSizing: 'border-box' }} />
                            <input type="number" min="0" value={draft.c} onChange={(event) => setDraftForMeal(meal.id, { c: event.target.value })} placeholder="C" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--c-border)', boxSizing: 'border-box' }} />
                            <input type="number" min="0" value={draft.f} onChange={(event) => setDraftForMeal(meal.id, { f: event.target.value })} placeholder="F" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--c-border)', boxSizing: 'border-box' }} />
                          </div>
                          <ImageUploadButton currentImage={draft.img} onImageSelect={(value) => setDraftForMeal(meal.id, { img: value || '' })} onRemove={() => setDraftForMeal(meal.id, { img: '' })} label="Poza ingredientului / preparatului" compact={compact} />
                          <textarea value={draft.note} onChange={(event) => setDraftForMeal(meal.id, { note: event.target.value })} placeholder="Notițe ingredient / instrucțiuni scurte" rows={2} style={{ width: '100%', marginTop: 10, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--c-border)', boxSizing: 'border-box', resize: 'vertical' }} />
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                            <button className="btn btn-outline btn-sm" onClick={() => resetDraftForMeal(meal.id)}>Curăță</button>
                            <button className="btn btn-lime btn-sm" onClick={() => addCustomIngredient(meal.id)}>+ Adaugă ingredientul meu</button>
                          </div>
                        </div>

                        <div>
                          <div style={{ fontWeight: 800, marginBottom: 8 }}>Ingrediente în masă</div>
                          {(meal.ingredients || []).length === 0 ? (
                            <div style={{ padding: 12, border: '1px solid var(--c-border)', borderRadius: 10, color: 'var(--c-ink3)', fontSize: 12 }}>Nu ai adăugat ingrediente încă.</div>
                          ) : (
                            <div style={{ display: 'grid', gap: 8 }}>
                              {(meal.ingredients || []).map((ingredient) => (
                                <div key={ingredient.id} style={{ display: 'grid', gridTemplateColumns: compact ? '1fr auto' : '56px 1fr auto', gap: 10, alignItems: 'center', padding: 10, borderRadius: 10, background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                                  {!compact && (ingredient.img ? <img src={ingredient.img} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover' }} /> : <div style={{ width: 56, height: 56, borderRadius: 10, background: 'var(--c-bg)', display: 'grid', placeItems: 'center' }}>🍴</div>)}
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 700 }}>{ingredient.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--c-ink3)' }}>{ingredient.quantity}</div>
                                    <div style={{ fontSize: 11, color: 'var(--c-ink3)', marginTop: 2 }}>{ingredient.kcal} kcal · P:{ingredient.p}g · C:{ingredient.c}g · F:{ingredient.f}g</div>
                                    {ingredient.note ? <div style={{ fontSize: 11, color: 'var(--c-ink2)', marginTop: 4 }}>{ingredient.note}</div> : null}
                                  </div>
                                  <button onClick={() => removeIngredientFromMeal(meal.id, ingredient.id)} style={{ background: 'none', border: 'none', color: 'var(--c-coral)', cursor: 'pointer', fontSize: 18 }}>✕</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <label style={{ fontSize: 10, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Rețetă / instrucțiuni</label>
                          <textarea value={meal.recipe || ''} onChange={(event) => updateMeal(meal.id, { recipe: event.target.value })} placeholder="Pașii de preparare, plating, suplimente, notițe pentru client..." rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--c-border)', boxSizing: 'border-box', resize: 'vertical' }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {MEAL_TYPES.filter((type) => !editMeals.find((meal) => meal.type === type)).map((type) => (
                  <button key={type} className="btn btn-outline btn-sm" onClick={() => addMeal(type)}>+ {type}</button>
                ))}
              </div>
            </div>

            <div style={{ position: 'sticky', bottom: 0, zIndex: 3, padding: compact ? '14px 18px 18px' : '16px 28px 24px', borderTop: '1px solid var(--c-border)', display: 'flex', gap: 8, justifyContent: compact ? 'stretch' : 'flex-end', flexDirection: compact ? 'column-reverse' : 'row', background: 'var(--c-surface)' }}>
              <button className="btn btn-outline" onClick={() => setShowEditor(false)}>Anulează</button>
              <button className="btn btn-lime" onClick={handleSave} disabled={loading || !editName.trim()} style={{ padding: '12px 32px', fontSize: 15 }}>
                {loading ? 'Se salvează...' : `✅ Salvează (${editMeals.length} mese)`}
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal open={!!showApply} onClose={() => { setShowApply(null); setSelectedClients([]); }} title={`Aplică: ${showApply?.name || showApply?.nm || ''}`}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--c-ink3)', marginBottom: 12 }}>Selectează clienții:</div>
          {clients.map((client) => (
            <div key={client.id} onClick={() => setSelectedClients((prev) => (prev.includes(client.id) ? prev.filter((item) => item !== client.id) : [...prev, client.id]))} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, marginBottom: 6, cursor: 'pointer', background: selectedClients.includes(client.id) ? 'rgba(184,237,0,0.08)' : 'transparent', border: `1px solid ${selectedClients.includes(client.id) ? 'rgba(184,237,0,0.25)' : 'var(--c-border)'}` }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, background: selectedClients.includes(client.id) ? '#B8ED00' : 'transparent', border: `2px solid ${selectedClients.includes(client.id) ? '#B8ED00' : 'var(--c-border2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
                {selectedClients.includes(client.id) ? '✓' : ''}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>{client.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{client.goal}</div>
              </div>
            </div>
          ))}
        </div>
        <ModalActions>
          <button className="btn btn-outline btn-sm" onClick={() => { setShowApply(null); setSelectedClients([]); }}>Anulează</button>
          <button className="btn btn-black" onClick={handleApply} disabled={!selectedClients.length}>Aplică ({selectedClients.length})</button>
        </ModalActions>
      </Modal>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 900 }}>Template-uri nutriție</div>
          <div style={{ fontSize: 13, color: 'var(--c-ink2)', marginTop: 2 }}>{templates.length} template-uri disponibile</div>
        </div>
        <button className="btn btn-lime" onClick={() => openEditor(null)} style={{ fontWeight: 800, fontSize: 14, padding: '10px 20px' }}>+ Template nou</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
        {templates.map((template) => {
          const templateName = template.name || template.nm || 'Template';
          const templateImage = roleCardImage(template);
          return (
            <div key={template.id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
              <div style={{ background: templateImage ? `url(${templateImage}) center/cover` : 'var(--c-ink)', height: 100, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 20%, rgba(0,0,0,0.8))' }} />
                <div style={{ position: 'absolute', bottom: 12, left: 16, color: '#fff' }}>
                  <div style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 900 }}>{templateName}</div>
                </div>
              </div>
              <div style={{ padding: '14px 16px 10px', display: 'flex', gap: 10 }}>
                {[['🔥', template.kcal, 'KCAL'], ['🥩', `${template.p || 0}g`, 'PROT'], ['🍚', `${template.c || 0}g`, 'CARBS'], ['🥑', `${template.f || 0}g`, 'FAT']].map(([icon, value, label]) => (
                  <div key={label} style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 14 }}>{icon}</div>
                    <div style={{ fontFamily: 'var(--fd)', fontSize: 16, fontWeight: 900 }}>{value}</div>
                    <div style={{ fontSize: 7, color: 'var(--c-ink3)', fontFamily: 'var(--fm)', letterSpacing: 1 }}>{label}</div>
                  </div>
                ))}
              </div>
              {template.mealPlan && template.mealPlan.length > 0 && (
                <div style={{ padding: '0 16px 10px' }}>
                  {template.mealPlan.slice(0, 3).map((meal, index) => (
                    <div key={meal.id || `${template.id}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: '1px solid var(--c-border)' }}>
                      {meal.img ? <img src={meal.img} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} /> : <span>🍽️</span>}
                      <div style={{ flex: 1, fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><b>{meal.type}:</b> {meal.name}</div>
                      <span style={{ fontSize: 10, color: 'var(--c-ink3)', flexShrink: 0 }}>{meal.kcal} kcal</span>
                    </div>
                  ))}
                  {template.mealPlan.length > 3 ? <div style={{ fontSize: 10, color: 'var(--c-ink3)', textAlign: 'center', paddingTop: 4 }}>+{template.mealPlan.length - 3} mese</div> : null}
                </div>
              )}
              <div style={{ padding: '8px 16px 14px', display: 'flex', gap: 8 }}>
                <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => openEditor(template)}>✏️ Editează</button>
                <button className="btn btn-black btn-sm" style={{ flex: 1 }} onClick={() => setShowApply(template)}>📤 Aplică</button>
                <button
                  className="btn btn-sm"
                  onClick={() => handleDeleteTemplate(template)}
                  title="Șterge template"
                  style={{ padding: '0 12px', border: '1.5px solid var(--c-coral)', background: 'transparent', color: 'var(--c-coral)', fontWeight: 700 }}
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </AnimatedPage>
  );
}
