import logging
import time
from langchain_core.callbacks.base import BaseCallbackHandler

logger = logging.getLogger(__name__)

class ObservabilityCallbackHandler(BaseCallbackHandler):
    """Callback handler para registrar uso de tokens e latência das chamadas LLM e Chains."""
    
    def __init__(self):
        self.start_times = {}
        
    def on_llm_start(self, serialized, prompts, **kwargs):
        run_id = kwargs.get('run_id')
        self.start_times[run_id] = time.time()
        logger.info(f"LLM Started (run_id: {run_id})")

    def on_llm_end(self, response, **kwargs):
        run_id = kwargs.get('run_id')
        start_time = self.start_times.get(run_id)
        if start_time:
            latency = time.time() - start_time
            logger.info(f"LLM Ended (run_id: {run_id}) - Latency: {latency:.2f}s")
        
        # Log token usage if available
        if response.llm_output and "token_usage" in response.llm_output:
            token_usage = response.llm_output["token_usage"]
            logger.info(f"LLM Token Usage: {token_usage}")

    def on_llm_error(self, error, **kwargs):
        run_id = kwargs.get('run_id')
        logger.error(f"LLM Error (run_id: {run_id}): {error}")

    def on_chain_start(self, serialized, inputs, **kwargs):
        run_id = kwargs.get('run_id')
        self.start_times[run_id] = time.time()
        logger.info(f"Chain Started (run_id: {run_id})")

    def on_chain_end(self, outputs, **kwargs):
        run_id = kwargs.get('run_id')
        start_time = self.start_times.get(run_id)
        if start_time:
            latency = time.time() - start_time
            logger.info(f"Chain Ended (run_id: {run_id}) - Latency: {latency:.2f}s")
            
    def on_chain_error(self, error, **kwargs):
        run_id = kwargs.get('run_id')
        logger.error(f"Chain Error (run_id: {run_id}): {error}")
