```css
/* ========================================
   SETTINGS PAGE
======================================== */

.settings-page {
  min-height: 100%;
  background: #ffffff;
}

.settings-section {
  border-bottom: 1px solid #eff3f4;
  padding: 24px 20px;
}

.settings-section-title {
  margin-bottom: 18px;
}

.settings-section-title h3 {
  margin: 0 0 5px;
  font-size: 20px;
  color: #0f1419;
}

.settings-section-title p {
  margin: 0;
  color: #536471;
  font-size: 14px;
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 14px 0;
}

.settings-item-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.settings-item-info strong {
  color: #0f1419;
  font-size: 16px;
}

.settings-item-info span {
  color: #536471;
  font-size: 14px;
}

.settings-toggle {
  width: 50px;
  height: 28px;
  border: none;
  border-radius: 999px;
  background: #cfd9de;
  padding: 3px;
  flex-shrink: 0;
  transition: background 0.2s ease;
}

.settings-toggle span {
  display: block;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #ffffff;
  transition: transform 0.2s ease;
}

.settings-toggle.enabled {
  background: #1d9bf0;
}

.settings-toggle.enabled span {
  transform: translateX(22px);
}

.settings-sign-out {
  width: 100%;
  padding: 13px 18px;
  border: 1px solid #f4212e;
  border-radius: 999px;
  background: #ffffff;
  color: #f4212e;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
}

.settings-sign-out:hover {
  background: #fff1f2;
}

@media (max-width: 700px) {
  .settings-section {
    padding: 20px 16px;
  }

  .settings-item-info strong {
    font-size: 15px;
  }

  .settings-item-info span {
    font-size: 13px;
  }
}
```;
