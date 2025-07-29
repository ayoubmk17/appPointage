package com.ram.pointage_app.services;

import com.ram.pointage_app.entities.Collaborator;
import com.ram.pointage_app.entities.Machine;
import com.ram.pointage_app.repositories.MachineRepo;
import org.springframework.stereotype.Service;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Enumeration;

import java.util.List;
import java.util.Optional;

@Service
public class MachineService {
    private final MachineRepo machineRepo;
    public MachineService(MachineRepo machineRepo) {this.machineRepo = machineRepo;}

    public List<Machine> getMachines() {return machineRepo.findAll();}

    public Optional<Machine> getMachine(Long id) {return machineRepo.findById(id);}

    public Machine createMachine(Machine machine) {
        machine.setMacAddress(getMacAddress());
        machine.setOrdName(getOrdName());
        return machineRepo.save(machine);
    }

    public static String getOrdName() {
        try {
            return InetAddress.getLocalHost().getHostName();
        } catch (Exception e) {
            return "unknown";
        }
    }

    public static String getMacAddress() {
        try {
            Enumeration<NetworkInterface> networkInterfaces = NetworkInterface.getNetworkInterfaces();
            while (networkInterfaces.hasMoreElements()) {
                NetworkInterface ni = networkInterfaces.nextElement();
                byte[] mac = ni.getHardwareAddress();
                if (mac != null && !ni.isVirtual() && !ni.isLoopback()) {
                    StringBuilder sb = new StringBuilder();
                    for (int i = 0; i < mac.length; i++) {
                        sb.append(String.format("%02X%s", mac[i], (i < mac.length - 1) ? "-" : ""));
                    }
                    return sb.toString();
                }
            }
        } catch (SocketException e) {
            e.printStackTrace();
        }
        return "00-00-00-00-00-00";
    }

    public String deleteMachine(Long id) {
        if (machineRepo.existsById(id)) {
            machineRepo.deleteById(id);
            return "Machine deleted";
        }
        return "Machine not found";
    }

}
