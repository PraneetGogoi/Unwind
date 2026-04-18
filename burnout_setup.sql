-- ==========================================================
-- Developer Burnout Analytics — PostgreSQL Setup
-- Run: psql -U <user> -d <dbname> -f burnout_setup.sql
-- ==========================================================

-- Drop & recreate schema
DROP TABLE IF EXISTS developer_burnout CASCADE;

CREATE TABLE developer_burnout (
    id                   SERIAL PRIMARY KEY,
    age                  NUMERIC(5,2),
    experience_years     NUMERIC(5,2),
    daily_work_hours     NUMERIC(5,2),
    sleep_hours          NUMERIC(5,2),
    caffeine_intake      NUMERIC(6,2),
    bugs_per_day         NUMERIC(6,2),
    commits_per_day      NUMERIC(6,2),
    meetings_per_day     NUMERIC(5,2),
    screen_time          NUMERIC(5,2),
    exercise_hours       NUMERIC(5,2),
    stress_level         NUMERIC(6,2),
    burnout_level        VARCHAR(10) CHECK(burnout_level IN ('Low','Medium','High')),
    work_life_balance    NUMERIC(8,4),
    productivity_ratio   NUMERIC(8,4),
    cognitive_load       NUMERIC(8,4),
    caffeine_per_sleep   NUMERIC(8,4),
    exp_tier             VARCHAR(15),
    age_group            VARCHAR(10),
    created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for dashboard queries
CREATE INDEX idx_burnout_level    ON developer_burnout(burnout_level);
CREATE INDEX idx_stress           ON developer_burnout(stress_level);
CREATE INDEX idx_exp_tier         ON developer_burnout(exp_tier);
CREATE INDEX idx_age_group        ON developer_burnout(age_group);

-- ── Analytical Views ───────────────────────────────────────────────────────

-- Summary stats per burnout level
CREATE OR REPLACE VIEW v_burnout_summary AS
SELECT
    burnout_level,
    COUNT(*) AS total_developers,
    ROUND(AVG(stress_level)::numeric, 2)       AS avg_stress,
    ROUND(AVG(daily_work_hours)::numeric, 2)   AS avg_work_hours,
    ROUND(AVG(sleep_hours)::numeric, 2)        AS avg_sleep,
    ROUND(AVG(exercise_hours)::numeric, 2)     AS avg_exercise,
    ROUND(AVG(caffeine_intake)::numeric, 2)    AS avg_caffeine,
    ROUND(AVG(commits_per_day)::numeric, 2)    AS avg_commits,
    ROUND(AVG(bugs_per_day)::numeric, 2)       AS avg_bugs,
    ROUND(AVG(meetings_per_day)::numeric, 2)   AS avg_meetings,
    ROUND(AVG(cognitive_load)::numeric, 2)     AS avg_cognitive_load,
    ROUND(AVG(work_life_balance)::numeric, 4)  AS avg_wlb_score
FROM developer_burnout
GROUP BY burnout_level
ORDER BY CASE burnout_level WHEN 'Low' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END;

-- Burnout distribution by experience tier
CREATE OR REPLACE VIEW v_burnout_by_experience AS
SELECT
    exp_tier,
    burnout_level,
    COUNT(*) AS cnt,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY exp_tier), 1) AS pct
FROM developer_burnout
GROUP BY exp_tier, burnout_level
ORDER BY exp_tier, burnout_level;

-- Burnout distribution by age group
CREATE OR REPLACE VIEW v_burnout_by_age AS
SELECT
    age_group,
    burnout_level,
    COUNT(*) AS cnt,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY age_group), 1) AS pct
FROM developer_burnout
GROUP BY age_group, burnout_level
ORDER BY age_group, burnout_level;

-- High-risk developers (High burnout + stress > 75)
CREATE OR REPLACE VIEW v_high_risk_developers AS
SELECT
    id, age, experience_years, exp_tier, age_group,
    stress_level, daily_work_hours, sleep_hours,
    exercise_hours, cognitive_load, work_life_balance
FROM developer_burnout
WHERE burnout_level = 'High' AND stress_level > 75
ORDER BY stress_level DESC;

-- Correlation summary (avg values for dashboard KPIs)
CREATE OR REPLACE VIEW v_kpi_summary AS
SELECT
    COUNT(*)                                            AS total_records,
    ROUND(AVG(stress_level)::numeric, 1)               AS overall_avg_stress,
    ROUND(AVG(sleep_hours)::numeric, 2)                AS overall_avg_sleep,
    ROUND(AVG(daily_work_hours)::numeric, 2)           AS overall_avg_work_hours,
    ROUND(AVG(exercise_hours)::numeric, 2)             AS overall_avg_exercise,
    COUNT(*) FILTER(WHERE burnout_level='High')      AS high_burnout_count,
    COUNT(*) FILTER(WHERE burnout_level='Medium')    AS medium_burnout_count,
    COUNT(*) FILTER(WHERE burnout_level='Low')       AS low_burnout_count,
    ROUND(100.0 * COUNT(*) FILTER(WHERE burnout_level='High') / COUNT(*), 1) AS high_burnout_pct
FROM developer_burnout;

-- ── COPY command to bulk-load CSV ─────────────────────────────────────────
-- Update the path below before running:
-- \COPY developer_burnout(
--     age, experience_years, daily_work_hours, sleep_hours, caffeine_intake,
--     bugs_per_day, commits_per_day, meetings_per_day, screen_time,
--     exercise_hours, stress_level, burnout_level
-- )
-- FROM '/absolute/path/to/developer_burnout_dataset_7000.csv'
-- WITH (FORMAT CSV, HEADER true, NULL '');

-- After loading, populate engineered columns:
UPDATE developer_burnout SET
    work_life_balance  = (sleep_hours + exercise_hours) / NULLIF(daily_work_hours + screen_time, 0),
    productivity_ratio = commits_per_day / NULLIF(bugs_per_day + meetings_per_day + 1, 0),
    cognitive_load     = bugs_per_day * 2 + meetings_per_day * 1.5 + daily_work_hours,
    caffeine_per_sleep = caffeine_intake / NULLIF(sleep_hours, 0),
    exp_tier = CASE
        WHEN experience_years <= 2  THEN 'Junior'
        WHEN experience_years <= 7  THEN 'Mid'
        WHEN experience_years <= 14 THEN 'Senior'
        ELSE 'Principal'
    END,
    age_group = CASE
        WHEN age BETWEEN 20 AND 25 THEN '20-25'
        WHEN age BETWEEN 26 AND 30 THEN '26-30'
        WHEN age BETWEEN 31 AND 35 THEN '31-35'
        WHEN age BETWEEN 36 AND 40 THEN '36-40'
        ELSE '41-44'
    END
WHERE work_life_balance IS NULL;

-- Verify
SELECT * FROM v_kpi_summary;
SELECT * FROM v_burnout_summary;
