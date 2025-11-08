import { useNavigate, useSearchParams } from "@solidjs/router";
import { Component, createEffect, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { ClientResponseError } from "pocketbase";
import ArrowLeft from "lucide-solid/icons/arrow-left";

import Container from "../views/app/Container";
import { Button } from "../components";
import Header from "../views/app/Header";
import AnalysisList from "../views/analysis/AnalysisList";
import { Analysis, AnalysisCreateData } from "../../Types";
import { useAuthPB } from "../config/pocketbase";
import AnalysisGraph from "../views/analysis/AnalysisGraph";

type SearchParams = {
  analysisId: string;
};

const Sessions: Component = () => {
  const [searchParams, setSearchParams] = useSearchParams<SearchParams>();
  const [analysis, setAnalysis] = createStore<{ analysis: Analysis | null }>({ analysis: null });
  const { pb, user, updateRecord, getAnalysisByID } = useAuthPB();
  const navigate = useNavigate();

  const createAnalysis = async () => {
    const createData: AnalysisCreateData = {
      user: user.id,
      title: "Analysis",
      description: "",
      series: [],
      filters: [],
    };
    try {
      const newAnalysis = await pb.collection<Analysis>("analyses").create(createData);

      setAnalysis({ analysis: newAnalysis });
      setSearchParams({ analysisId: newAnalysis.id });
    } catch (e) {
      console.error(e);
    }
  };

  const analysisUpdate = async (field: string, newVal: any) => {
    if (analysis.analysis?.id) {
      return await updateRecord<Analysis>("analyses", analysis.analysis?.id, field, newVal);
    } else {
      throw new Error("Tried to update an analysis when missing id");
    }
  };

  const _getAnalysisByID = async () => {
    let id = searchParams.analysisId;

    if (!id) {
      setAnalysis({ analysis: null });
    } else {
      try {
        const a = await getAnalysisByID(id);
        setAnalysis("analysis", a);
      } catch (e) {
        if (e instanceof ClientResponseError && e.isAbort) {
        } else {
          throw new Error("Problem fetching session", { cause: e });
        }
      }
    }
  };

  createEffect(() => {
    _getAnalysisByID();
  });

  return (
    <>
      <Header>
        <div class="flex justify-start items-center">
          <Show
            when={analysis.analysis != null && !!searchParams.analysisId}
            fallback={<h1 class="text-xl font-bold">Analysis</h1>}
          >
            <Button variant="text" onClick={() => navigate(-1)}>
              <ArrowLeft />
            </Button>
            <h1 class="text-xl font-bold">{analysis.analysis?.title}</h1>
          </Show>
        </div>
      </Header>
      <Container class="pb-25 overflow-y-auto py-0 bg-charcoal-500">
        <Show
          when={analysis.analysis != null && !!searchParams.analysisId}
          fallback={
            <AnalysisList
              createAnalysis={createAnalysis}
              onClick={(r) => setSearchParams({ analysisId: r.id })}
            />
          }
        >
          <AnalysisGraph analysis={analysis.analysis!} setAnalysis={setAnalysis} />
        </Show>
      </Container>
    </>
  );
};

export default Sessions;
