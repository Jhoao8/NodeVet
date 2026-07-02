package com.nodevet.app.service.pago;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class PagoConfigService {

    private final AtomicBoolean pagoObligatorio;

    public PagoConfigService(@Value("${nodevet.pagos.obligatorio:true}") boolean pagoObligatorioInicial) {
        this.pagoObligatorio = new AtomicBoolean(pagoObligatorioInicial);
    }

    public boolean isPagoObligatorio() {
        return pagoObligatorio.get();
    }

    public boolean setPagoObligatorio(boolean habilitado) {
        pagoObligatorio.set(habilitado);
        return pagoObligatorio.get();
    }
}
