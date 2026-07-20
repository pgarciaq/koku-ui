import {
  ActionGroup,
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  FormHelperText,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem,
  NumberInput,
  PageSection,
  Spinner,
  Tab,
  Tabs,
  TabTitleText,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { LockIcon } from '@patternfly/react-icons';
import type {
  RecommendationTermSetting,
  RecommendationTermSettingsType,
  RecommendationTermSettingUpdate,
} from 'api/ros/termSettings';
import {
  fetchRecommendationTermSettings,
  resetRecommendationTermSettings,
  updateRecommendationTermSettings,
} from 'api/ros/termSettings';
import messages from 'locales/messages';
import React, { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { DecayCurveChart } from './decayCurveChart';

const PLUGIN_TABS: { type: RecommendationTermSettingsType; messageKey: keyof typeof messages }[] = [
  { type: 'container', messageKey: 'decaySettingsPluginContainer' },
  { type: 'namespace', messageKey: 'decaySettingsPluginNamespace' },
  { type: 'node', messageKey: 'decaySettingsPluginNode' },
  { type: 'gpu', messageKey: 'decaySettingsPluginGpu' },
  { type: 'pvc', messageKey: 'decaySettingsPluginPvc' },
  { type: 'vm', messageKey: 'decaySettingsPluginVm' },
];

const MAX_WINDOW_DAYS: Record<RecommendationTermSettingsType, number> = {
  container: 90,
  namespace: 90,
  node: 90,
  gpu: 90,
  pvc: 365,
  vm: 90,
};

const MAX_HALFLIFE_HOURS = 8760;

interface TermFormState {
  window_days: number;
  decay_halflife_hours: number;
}

interface TermValidation {
  window_days?: string;
  decay_halflife_hours?: string;
}

const termNameLabel = (name: string, intl: ReturnType<typeof useIntl>) => {
  switch (name) {
    case 'short':
      return intl.formatMessage(messages.decaySettingsTermShort);
    case 'medium':
      return intl.formatMessage(messages.decaySettingsTermMedium);
    case 'long':
      return intl.formatMessage(messages.decaySettingsTermLong);
    default:
      return name;
  }
};

const DecaySettings: React.FC = () => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState<RecommendationTermSettingsType>('container');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settingsLocked, setSettingsLocked] = useState(false);
  const [terms, setTerms] = useState<RecommendationTermSetting[]>([]);
  const [formState, setFormState] = useState<Record<string, TermFormState>>({});
  const [validation, setValidation] = useState<Record<string, TermValidation>>({});
  const [alert, setAlert] = useState<{ variant: 'success' | 'danger'; message: string } | null>(null);

  const loadSettings = useCallback(
    async (type: RecommendationTermSettingsType) => {
      setIsLoading(true);
      setAlert(null);
      try {
        const response = await fetchRecommendationTermSettings(type);
        const data = response.data;
        setSettingsLocked(data.settings_locked ?? false);
        setTerms(data.terms);
        const newFormState: Record<string, TermFormState> = {};
        for (const term of data.terms) {
          newFormState[term.name] = {
            window_days: term.window_days,
            decay_halflife_hours: term.decay_halflife_hours ?? 0,
          };
        }
        setFormState(newFormState);
        setValidation({});
      } catch {
        setTerms([]);
        setFormState({});
      }
      setIsLoading(false);
    },
    []
  );

  useEffect(() => {
    loadSettings(activeTab);
  }, [activeTab, loadSettings]);

  const maxWindow = MAX_WINDOW_DAYS[activeTab];

  const validateField = useCallback(
    (termName: string, field: keyof TermFormState, value: number) => {
      setValidation(prev => {
        const termValid = { ...prev[termName] };
        if (field === 'window_days') {
          termValid.window_days =
            value >= 1 && value <= maxWindow
              ? undefined
              : intl.formatMessage(messages.decaySettingsValidationWindowRange, { max: maxWindow });
        } else if (field === 'decay_halflife_hours') {
          termValid.decay_halflife_hours =
            value >= 0 && value <= MAX_HALFLIFE_HOURS
              ? undefined
              : intl.formatMessage(messages.decaySettingsValidationHalfLifeRange);
        }
        return { ...prev, [termName]: termValid };
      });
    },
    [intl, maxWindow]
  );

  const handleFieldChange = (termName: string, field: keyof TermFormState, value: number) => {
    const clamped = Math.max(0, Math.round(value));
    setFormState(prev => ({
      ...prev,
      [termName]: { ...prev[termName], [field]: clamped },
    }));
    validateField(termName, field, clamped);
  };

  const hasValidationErrors = Object.values(validation).some(v => v.window_days || v.decay_halflife_hours);

  const hasChanges = terms.some(term => {
    const fs = formState[term.name];
    if (!fs) {
      return false;
    }
    return fs.window_days !== term.window_days || fs.decay_halflife_hours !== (term.decay_halflife_hours ?? 0);
  });

  const handleSave = async () => {
    if (hasValidationErrors || settingsLocked) {
      return;
    }
    setIsSaving(true);
    setAlert(null);
    try {
      const updates: RecommendationTermSettingUpdate[] = terms.map(term => {
        const fs = formState[term.name];
        return {
          name: term.name,
          window_days: fs?.window_days ?? term.window_days,
          decay_halflife_hours: fs?.decay_halflife_hours ?? (term.decay_halflife_hours ?? 0),
        };
      });
      await updateRecommendationTermSettings(activeTab, updates);
      setAlert({ variant: 'success', message: intl.formatMessage(messages.decaySettingsSaveSuccess) });
      await loadSettings(activeTab);
    } catch {
      setAlert({ variant: 'danger', message: intl.formatMessage(messages.decaySettingsSaveError) });
    }
    setIsSaving(false);
  };

  const handleReset = async () => {
    if (settingsLocked) {
      return;
    }
    setIsSaving(true);
    setAlert(null);
    try {
      await resetRecommendationTermSettings(activeTab);
      setAlert({ variant: 'success', message: intl.formatMessage(messages.decaySettingsResetSuccess) });
      await loadSettings(activeTab);
    } catch {
      setAlert({ variant: 'danger', message: intl.formatMessage(messages.decaySettingsResetError) });
    }
    setIsSaving(false);
  };

  return (
    <PageSection hasBodyWrapper={false}>
      <Title headingLevel="h1" size="2xl" style={{ marginBottom: 8 }}>
        {intl.formatMessage(messages.decaySettingsTitle)}
      </Title>
      <p style={{ marginBottom: 24, color: 'var(--pf-t--global--text--color--subtle)' }}>
        {intl.formatMessage(messages.decaySettingsDesc)}
      </p>

      {alert && (
        <Alert
          isInline
          variant={alert.variant}
          title={alert.message}
          style={{ marginBottom: 16 }}
          actionClose={<Button variant="plain" onClick={() => setAlert(null)} aria-label="Close" />}
        />
      )}

      <Tabs
        activeKey={activeTab}
        onSelect={(_event, key) => setActiveTab(key as RecommendationTermSettingsType)}
        aria-label="Recommendation type tabs"
        style={{ marginBottom: 16 }}
      >
        {PLUGIN_TABS.map(tab => (
          <Tab
            key={tab.type}
            eventKey={tab.type}
            title={<TabTitleText>{intl.formatMessage(messages[tab.messageKey])}</TabTitleText>}
          />
        ))}
      </Tabs>

      {isLoading ? (
        <Spinner size="lg" aria-label="Loading settings" />
      ) : (
        <Form isWidthLimited>
          <Grid hasGutter>
            {terms.map(term => {
              const fs = formState[term.name];
              const tv = validation[term.name];
              const isLocked = term.locked || settingsLocked;
              if (!fs) {
                return null;
              }

              return (
                <GridItem key={term.name} md={4} sm={12}>
                  <Card isCompact>
                    <CardTitle>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Title headingLevel="h3" size="md">
                          {termNameLabel(term.name, intl)}
                        </Title>
                        {term.is_default && (
                          <Badge isRead>{intl.formatMessage(messages.decaySettingsDefault)}</Badge>
                        )}
                        {isLocked && (
                          <Tooltip content={intl.formatMessage(messages.decaySettingsLockedTooltip)}>
                            <LockIcon color="var(--pf-t--global--text--color--subtle)" />
                          </Tooltip>
                        )}
                      </div>
                    </CardTitle>
                    <CardBody>
                      <FormGroup
                        label={intl.formatMessage(messages.decaySettingsWindowDays)}
                        fieldId={`window-${term.name}`}
                      >
                        <NumberInput
                          id={`window-${term.name}`}
                          value={fs.window_days}
                          min={1}
                          max={maxWindow}
                          isDisabled={isLocked}
                          onMinus={() => handleFieldChange(term.name, 'window_days', fs.window_days - 1)}
                          onPlus={() => handleFieldChange(term.name, 'window_days', fs.window_days + 1)}
                          onChange={event =>
                            handleFieldChange(term.name, 'window_days', parseInt((event.target as HTMLInputElement).value, 10) || 0)
                          }
                          validated={tv?.window_days ? 'error' : 'default'}
                          widthChars={5}
                        />
                        {tv?.window_days && (
                          <FormHelperText>
                            <HelperText>
                              <HelperTextItem variant="error">{tv.window_days}</HelperTextItem>
                            </HelperText>
                          </FormHelperText>
                        )}
                      </FormGroup>

                      <FormGroup
                        label={intl.formatMessage(messages.decaySettingsMinDataDays)}
                        fieldId={`mindata-${term.name}`}
                        style={{ marginTop: 12 }}
                      >
                        <NumberInput
                          id={`mindata-${term.name}`}
                          value={term.min_data_days ?? Math.ceil(fs.window_days / 2)}
                          isDisabled
                          widthChars={5}
                        />
                        <FormHelperText>
                          <HelperText>
                            <HelperTextItem variant="indeterminate">Auto-derived from window</HelperTextItem>
                          </HelperText>
                        </FormHelperText>
                      </FormGroup>

                      <FormGroup
                        label={intl.formatMessage(messages.decaySettingsHalfLifeHours)}
                        fieldId={`halflife-${term.name}`}
                        style={{ marginTop: 12 }}
                      >
                        <NumberInput
                          id={`halflife-${term.name}`}
                          value={fs.decay_halflife_hours}
                          min={0}
                          max={MAX_HALFLIFE_HOURS}
                          isDisabled={isLocked}
                          onMinus={() =>
                            handleFieldChange(term.name, 'decay_halflife_hours', fs.decay_halflife_hours - 1)
                          }
                          onPlus={() =>
                            handleFieldChange(term.name, 'decay_halflife_hours', fs.decay_halflife_hours + 1)
                          }
                          onChange={event =>
                            handleFieldChange(
                              term.name,
                              'decay_halflife_hours',
                              parseInt((event.target as HTMLInputElement).value, 10) || 0
                            )
                          }
                          validated={tv?.decay_halflife_hours ? 'error' : 'default'}
                          widthChars={5}
                        />
                        {tv?.decay_halflife_hours && (
                          <FormHelperText>
                            <HelperText>
                              <HelperTextItem variant="error">{tv.decay_halflife_hours}</HelperTextItem>
                            </HelperText>
                          </FormHelperText>
                        )}
                      </FormGroup>

                      <div style={{ marginTop: 16 }}>
                        <DecayCurveChart
                          halfLifeHours={fs.decay_halflife_hours}
                          windowDays={fs.window_days}
                          height={160}
                        />
                      </div>
                    </CardBody>
                  </Card>
                </GridItem>
              );
            })}
          </Grid>

          <ActionGroup style={{ marginTop: 24 }}>
            <Button
              variant="primary"
              onClick={handleSave}
              isDisabled={!hasChanges || hasValidationErrors || settingsLocked || isSaving}
              isLoading={isSaving}
            >
              {intl.formatMessage(messages.decaySettingsSave)}
            </Button>
            <Button variant="secondary" onClick={handleReset} isDisabled={settingsLocked || isSaving}>
              {intl.formatMessage(messages.decaySettingsResetDefaults)}
            </Button>
          </ActionGroup>
        </Form>
      )}
    </PageSection>
  );
};

export default DecaySettings;
export { DecaySettings };
