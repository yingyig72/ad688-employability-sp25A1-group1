# Steps 4 & 5 — Plotly Theming & GitHub Pages Guide

## Step 4: Consistent Plotly Theme

The `.qmd` files already include a consistent theme applied at the top of each file.
Here's the reusable theme snippet — if you add new pages, paste this at the top of your
setup code cell:

```python
import plotly.graph_objects as go
import plotly.io as pio

custom_template = go.layout.Template()
custom_template.layout = go.Layout(
    font=dict(family="Segoe UI, Roboto, sans-serif", size=13, color="#2c3e50"),
    title=dict(font=dict(size=20, color="#2c3e50"), x=0.5, xanchor="center"),
    paper_bgcolor="white",
    plot_bgcolor="#f8f9fa",
    colorway=["#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6",
              "#1abc9c", "#e67e22", "#34495e", "#16a085", "#c0392b"],
    xaxis=dict(gridcolor="#dee2e6", linecolor="#adb5bd"),
    yaxis=dict(gridcolor="#dee2e6", linecolor="#adb5bd"),
    hoverlabel=dict(font_size=12),
    margin=dict(t=60, b=40, l=50, r=30),
)
pio.templates["job_market"] = custom_template
pio.templates.default = "job_market"
```

---

## Step 5: Preventing GitHub Pages Rendering Errors

### 5.1 — Modify `_quarto.yml`

Make sure `execute` settings avoid re-running code on GitHub:

```yaml
execute:
  echo: true
  eval: true
  code-fold: true
  freeze: auto        # <-- prevents re-execution on CI
```

### 5.2 — Save Plotly Charts as Static Images

Large interactive Plotly charts can cause rendering failures. Save them to a
`figures/` folder as fallback:

```python
import os
os.makedirs("figures", exist_ok=True)

# After creating any Plotly figure:
fig.write_image("figures/my_chart.png", width=900, height=500, scale=2)
```

Then reference them in your `.qmd` as a fallback:

```markdown
![Chart Title](figures/my_chart.png)
```

### 5.3 — Render Locally First

Always render before pushing:

```bash
quarto render
```

Check the `_site/` folder to make sure everything looks correct.

### 5.4 — Update `.gitignore`

Add these lines to `.gitignore` to exclude large files:

```
# Large data files
*.csv
*.xlsx
*.parquet
job_market_data.csv

# OS files
.DS_Store
Thumbs.db

# Python
__pycache__/
*.pyc
.ipynb_checkpoints/

# Don't ignore the figures folder
!figures/
```

### 5.5 — Push Workflow

```bash
# 1. Render locally
quarto render

# 2. Stage everything
git add .

# 3. Commit
git commit -m "Updated EDA, skill gap analysis, and career strategy pages"

# 4. Pull first to avoid conflicts
git pull origin main --rebase

# 5. Push
git push origin main
```

### 5.6 — If GitHub Pages Still Fails

- Check the **Actions** tab on GitHub for error logs
- Look for missing image files — make sure `figures/` is committed
- Ensure no single file exceeds 100 MB (GitHub's limit)
- Try `quarto publish gh-pages` for a cleaner deployment
